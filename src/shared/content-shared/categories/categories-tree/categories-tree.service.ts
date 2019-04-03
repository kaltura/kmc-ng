import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CategoriesTreeNode, NodeChildrenStatuses } from './categories-tree-node';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { CategoriesSearchService, CategoryData } from '../categories-search.service';
import { modulesConfig } from 'config/modules';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';


@Injectable()
export class CategoriesTreeService {
    private _inLazyMode = false;

    constructor(private _categoriesSearchService: CategoriesSearchService,
                private _permissions: KMCPermissionsService,
                private appLocalization: AppLocalization) {
        this._inLazyMode = this._permissions.hasPermission(KMCPermissions.DYNAMIC_FLAG_KMC_CHUNKED_CATEGORY_LOAD);
    }

    public getCategories(): Observable<{ categories: CategoriesTreeNode[] }> {

        return Observable.create(observer => {
            const categories$ = this._inLazyMode ? this._categoriesSearchService.getRootCategories() : this._categoriesSearchService.getAllCategories();
            let categories = [];
            const categoriesSubsciption = categories$.subscribe(result => {
                    categories = this.createNode(result.items);
                    observer.next({categories: categories});
                    observer.complete();
                },
                error => {
                    observer.error(error);
                });

            return () => {
                if (categoriesSubsciption) {
                    categoriesSubsciption.unsubscribe();
                }
            };
        });
    }

    public loadNodeChildren(node: CategoriesTreeNode, onPostLoad?: (node: CategoriesTreeNode) => void): void {
        // load node children, relevant only if 'inLazyMode' and node children weren't loaded already
        if (this._inLazyMode && node && node instanceof CategoriesTreeNode) {

            // make sure the node children weren't loaded already.
            if (node.childrenStatus !== NodeChildrenStatuses.loaded && node.childrenStatus !== NodeChildrenStatuses.loading) {

                const maxNumberOfChildren = modulesConfig.contentShared.categories.maxTreeItemChildrenToShow;
                if (node.childrenCount > maxNumberOfChildren) {
                    node.setChildrenLoadStatus(
                        NodeChildrenStatuses.error,
                        this.appLocalization.get(
                            'entriesShared.categoriesFilters.maxChildrenExceeded',
                            {childrenCount: maxNumberOfChildren}
                        )
                    );
                } else {
                    node.setChildrenLoadStatus(NodeChildrenStatuses.loading);

                    this._categoriesSearchService.getChildrenCategories(node.value).subscribe(result => {
                            // add children to the node
                            const nodeChildren = this.createNode(result.items, node);

                            if (onPostLoad) {
                                onPostLoad.call(this, node);
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
            items.sort((a, b) => {
                const aValue = a ? a['partnerSortValue'] || 0 : 0;
                const bValue = b ? b['partnerSortValue'] || 0 : 0;
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            });

            const map: { [key: string]: CategoriesTreeNode } = {};
            const childrenNodes: { parentId: any, node: CategoriesTreeNode }[] = [];

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
