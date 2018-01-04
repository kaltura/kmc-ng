import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { CategoriesTreeNode, NodeChildrenStatuses } from './categories-tree-node';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { CategoriesSearchService, CategoryData } from '../categories-search.service';
import { environment } from 'app-environment';


@Injectable()
export class CategoriesTreeService {
  private _inLazyMode = false;

  constructor(private _categoriesSearchService: CategoriesSearchService,
              private appAuthentication: AppAuthentication,
              private appLocalization: AppLocalization) {
    this._inLazyMode = this.appAuthentication.appUser.permissionsFlags.indexOf('DYNAMIC_FLAG_KMC_CHUNKED_CATEGORY_LOAD') !== -1;
  }

  public getCategories(): Observable<{ categories: CategoriesTreeNode[] }> {
    return Observable.create(observer => {
      const categories$ = this._inLazyMode ? this._categoriesSearchService.getRootCategories() : this._categoriesSearchService.getAllCategories();
      let categories = [];
      const categoriesSubsciption = categories$.subscribe(result => {
          categories = this.createNode(result.items);
          observer.next({ categories: categories });
          observer.complete();
        },
        error => {
          observer.error(error);
        });

      return () => {
        if (categoriesSubsciption) {
          categoriesSubsciption.unsubscribe();
        }
      }

    });
  }

  public loadNodeChildren(node: CategoriesTreeNode, childrenResolver?: (children: CategoriesTreeNode[]) => CategoriesTreeNode[]): void {
    // load node children, relevant only if 'inLazyMode' and node children weren't loaded already
    if (this._inLazyMode && node && node instanceof CategoriesTreeNode) {

      // make sure the node children weren't loaded already.
      if (node.childrenStatus !== NodeChildrenStatuses.loaded && node.childrenStatus !== NodeChildrenStatuses.loading) {

        const maxNumberOfChildren = environment.entriesShared.categoriesFilters.maxChildrenToShow;
        if (node.childrenCount > maxNumberOfChildren) {
          node.setChildrenLoadStatus(
            NodeChildrenStatuses.error,
            this.appLocalization.get(
              'entriesShared.categoriesFilters.maxChildrenExceeded',
              { childrenCount: maxNumberOfChildren }
            )
          );
        } else {
          node.setChildrenLoadStatus(NodeChildrenStatuses.loading);

          this._categoriesSearchService.getChildrenCategories(node.value).subscribe(result => {
              // add children to the node
              let nodeChildren = this.createNode(result.items);

              if (childrenResolver) {
                nodeChildren = childrenResolver.call(this, nodeChildren);
              }

              if (nodeChildren) {
                node.setChildren(nodeChildren);
              }
            },
            error => {
              node.setChildrenLoadStatus(NodeChildrenStatuses.error,
                error.message);
            });
        }
      }
    } else {
      console.warn('[kmcng] - not in lazy mode loading. Ignoring call');
    }
  }

    createNode(items: CategoryData[], parentNode: CategoriesTreeNode = null): CategoriesTreeNode[] {
        const result: CategoriesTreeNode[] = [];
        const rootParent = parentNode || null;
        const rootParentId = rootParent ? rootParent.value : null;

        if (items && items.length > 0) {

            // sort items if required
            // TODO sakal
            // items.sort((a, b) => {
            //     let sortField = args.nameProperty;
            //     let aValue: any, bValue: any;
            //     if (args.sortByProperty && a[args.sortByProperty] !== b[args.sortByProperty]) {
            //         sortField = args.sortByProperty;
            //     }
            //     if (typeof a[sortField] === 'string') {
            //         aValue = (a[sortField] || '').toLowerCase();
            //         bValue = (b[sortField] || '').toLowerCase();
            //     } else {
            //         aValue = a[sortField] || 0;
            //         bValue = b[sortField] || 0;
            //     }
            //     return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            // });


            const map: { [key: string]: CategoriesTreeNode} = {};
            const childrenNodes: {parentId: any, node: CategoriesTreeNode }[] = [];

            items.forEach(item => {
                const itemParentId = item.parentId || null;
                const itemChildrenCount = item.childrenCount || null;
                const itemId = item.id;
                const itemName = item.name;

                const node = new CategoriesTreeNode(itemId, itemName, itemChildrenCount, item);

                if (itemParentId !== rootParentId) {
                    childrenNodes.push({parentId: itemParentId, node: node});
                } else {
                    node.parent = rootParent;

                    if (rootParent) {
                        if (rootParent.children === null) {
                            rootParent.setChildren([]);
                        }

                        rootParent.children.push(node);
                    }

                    result.push(node);
                }
                map[itemId] = node;
            });

            childrenNodes.forEach((childrenNodeData) => {
                const parent = map[childrenNodeData.parentId];
                if (parent) {

                    childrenNodeData.node.parent = parent;

                    if (parent.children === null) {
                        parent.setChildren([]);
                    }

                    parent.children.push(childrenNodeData.node);
                }
            });
        }

        return result;
    }
}
