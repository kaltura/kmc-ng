import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { NodeChildrenStatuses, PrimeTreeDataProvider, PrimeTreeNode } from '@kaltura-ng/kaltura-primeng-ui';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { CategoriesSearchService, CategoryData } from '../categories-search.service';
import { environment } from 'app-environment';

@Injectable()
export class CategoriesTreeService {
  private _inLazyMode = false;

  constructor(private _categoriesSearchService: CategoriesSearchService,
              private primeTreeDataProvider: PrimeTreeDataProvider,
              private appAuthentication: AppAuthentication,
              private appLocalization: AppLocalization) {
    this._inLazyMode = this.appAuthentication.appUser.permissionsFlags.indexOf('DYNAMIC_FLAG_KMC_CHUNKED_CATEGORY_LOAD') !== -1;
  }

  public getCategories(): Observable<{ categories: PrimeTreeNode[] }> {
    return Observable.create(observer => {
      const categories$ = this._inLazyMode ? this._categoriesSearchService.getRootCategories() : this._categoriesSearchService.getAllCategories();
      let categories = [];
      const categoriesSubsciption = categories$.subscribe(result => {
          categories = this.primeTreeDataProvider.create(
            this.createTreeHandlerArguments(result.items)
          );
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

  public loadNodeChildren(node: PrimeTreeNode, childrenResolver?: (children: PrimeTreeNode[]) => PrimeTreeNode[]): void {
    // load node children, relevant only if 'inLazyMode' and node children weren't loaded already
    if (this._inLazyMode && node && node instanceof PrimeTreeNode) {

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

          this._categoriesSearchService.getChildrenCategories(<number>node.data).subscribe(result => {
              // add children to the node
              let nodeChildren = this.primeTreeDataProvider.create(
                this.createTreeHandlerArguments(result.items, node)
              );

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


  private createTreeHandlerArguments(items: any[], parentNode: PrimeTreeNode = null): any {
    return {
      items: items,
      idProperty: 'id',
      nameProperty: 'name',
      parentIdProperty: 'parentId',
      sortByProperty: 'sortValue',
      childrenCountProperty: 'childrenCount',
      rootParent: parentNode
    }
  }
}
