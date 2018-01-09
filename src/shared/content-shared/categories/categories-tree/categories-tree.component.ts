import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { CategoriesTreeNode } from './categories-tree-node';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { CategoriesTreePropagationDirective } from './categories-tree-propagation.directive';
import { CategoriesTreeService } from './categories-tree.service';
import { CategoriesListItem } from 'app-shared/content-shared/categories/categories-list-type';
import { FiltersUtils } from '@kaltura-ng/mc-shared/filters/filters-utils';

export type TreeSelectionMode = 'single' | 'multiple';

@Component({
  selector: 'k-categories-tree',
  templateUrl: './categories-tree.component.html',
  styleUrls: ['./categories-tree.component.scss'],
  providers: [CategoriesTreeService]
})
export class CategoriesTreeComponent implements OnInit, OnChanges {

    @Input() public disablePropagation = true;

    @Input() public selectedCategories: CategoriesListItem[];
    @Input() public selectedCategory: CategoriesListItem;
    @Input() selectionMode: TreeSelectionMode = 'multiple';

    @Output() onCategoriesLoaded = new EventEmitter<{ totalCategories: number }>();

    @Output() onCategorySelected: EventEmitter<CategoriesListItem> = new EventEmitter();
    @Output() onCategoryUnselected: EventEmitter<CategoriesListItem> = new EventEmitter();

    @Output() selectedCategoryChange = new EventEmitter<CategoriesListItem>();
    @Output() selectedCategoriesChange = new EventEmitter<CategoriesListItem[]>();

    @ViewChild(CategoriesTreePropagationDirective) public _categoriesTreePropagation: CategoriesTreePropagationDirective;
    @ViewChild(CategoriesTreePropagationDirective) _CategoriesTreeNodesState: CategoriesTreePropagationDirective;

    public _selectedTreeNodes: CategoriesTreeNode[] = [];
    public _selectedTreeNode: CategoriesTreeNode = null;
    public _categories: CategoriesTreeNode[] = [];
    public _loading = false;
    public _blockerMessage: AreaBlockerMessage = null;

    private inLazyMode = false;
    private _selectedCategory: CategoriesListItem;
    private _selectedCategories: CategoriesListItem[] = [];

    public get categories(): CategoriesTreeNode[] {
        return this._categories;
    }

    constructor(private _categoriesTreeService: CategoriesTreeService,
                private _appAuthentication: AppAuthentication,
                private _appLocalization: AppLocalization) {
    }


    ngOnChanges(changes) {
        if (typeof changes.selectedCategories !== 'undefined') {
            if (this.selectionMode === 'multiple') {
                this._selectedCategories = changes.selectedCategories.currentValue ? [...changes.selectedCategories.currentValue] : [];
                this._syncTreeSelections();
            }
        }

        if (typeof changes.selectedCategory !== 'undefined') {
            if (this.selectionMode === 'single') {
                this._selectedCategory = changes.selectedCategory.currentValue;
                this._syncSelectedTreeNode();
            }
        }
    }

    ngOnInit() {
        this.inLazyMode = this._appAuthentication.appUser.permissionsFlags.indexOf('DYNAMIC_FLAG_KMC_CHUNKED_CATEGORY_LOAD') !== -1;

        this._loadCategories();
    }

    private _syncSelectedTreeNode() {
        if (this.selectionMode === 'single') {
            if (this._selectedTreeNode && this._selectedCategory) {
                if (this._selectedTreeNode.value !== this._selectedCategory.value) {
                    this._selectedTreeNode = this._findNodeByFullIdPath(this._selectedCategory.fullIdPath) || null;
                }
            } else if (!this._selectedTreeNode && this._selectedCategory) {
                this._selectedTreeNode = this._findNodeByFullIdPath(this._selectedCategory.fullIdPath) || null;
            } else if (this._selectedTreeNode && !this._selectedCategory) {
                this._selectedTreeNode = null;
            }
        }
    }

    private _syncTreeSelections() {
        if (this.selectionMode === 'multiple') {
            const listSelectionsMap = FiltersUtils.toMap(this._selectedTreeNodes, 'value');
            const listFilterMap = FiltersUtils.toMap(this._selectedCategories || [], 'value');
            const diff = FiltersUtils.getDiff(listSelectionsMap, listFilterMap);

            diff.added.forEach(item => {
                const nodeOfFilter = this._findNodeByFullIdPath(item.fullIdPath);

                if (nodeOfFilter) {
                    // update selection of tree - handle situation when the node was added by auto-complete
                    if (this._selectedTreeNodes.indexOf(nodeOfFilter) === -1) {
                        // IMPORTANT - we create a new array and not altering the existing one due to out-of-sync issue with angular binding.
                        this._selectedTreeNodes = [...this._selectedTreeNodes, nodeOfFilter];
                    }
                }
            });

            diff.deleted.forEach(removedItem => {
                this._selectedTreeNodes = this._selectedTreeNodes.filter(item => item !== removedItem);
            });
        }
    }

    private _convertToCategory(node: CategoriesTreeNode): CategoriesListItem {

        return {
            value: node.value, label: node.label,
            fullIdPath: node.origin.fullIdPath,
            tooltip: (node.origin.fullNamePath || []).join(' > ')
        };
    }


    public _onNodeSelect(node) {
        const category = this._convertToCategory(node);

        if (this.selectionMode === 'single') {
            this._selectedTreeNode = node;
            this._selectedCategory = category;
            this.selectedCategoryChange.emit(category);
        } else {
            this._selectedCategories.push(category);
            this.selectedCategoriesChange.emit(this._selectedCategories);
        }
        this.onCategorySelected.emit(category);
    }

    public _onNodeUnselect({node}) {

        if (this.selectionMode === 'multiple') {
            const nodeIndex = (this._selectedCategories || []).findIndex(item => item.value === node.value);
            if (nodeIndex !== -1) {
                const category = this._selectedCategories.splice(
                    nodeIndex,
                    1
                );

                this.onCategoryUnselected.emit(category[0]);
            }
        }


    }


    private _loadCategories(): void {
        this._loading = true;
        this._blockerMessage = null;
        this._categoriesTreeService.getCategories()
            .subscribe(result => {
                    this._categories = result.categories;
                    this._loading = false;

                    this._syncTreeSelections();
                    this._syncSelectedTreeNode();

                    this.onCategoriesLoaded.emit({totalCategories: (this._categories || []).length});
                },
                error => {
                    this._blockerMessage = new AreaBlockerMessage({
                        message: error.message || this._appLocalization.get('shared.contentShared.categoriesTree.errors.categoriesLoadError'),
                        buttons: [{
                            label: this._appLocalization.get('app.common.retry'),
                            action: () => this._loadCategories()
                        }]
                    });
                    this._loading = false;
                });
    }


    public _onNodeExpand(event: any): void {
        const node: CategoriesTreeNode = event && event.node instanceof CategoriesTreeNode ? event.node : null;

        if (node && this.inLazyMode) {
            this._categoriesTreeService.loadNodeChildren(node, (children) => {
                if (node instanceof CategoriesTreeNode && node.children) {
                    node.children.forEach(nodeChild => {

                        if (this.selectionMode === 'single')
                        {
                            if (this.selectedCategory && this.selectedCategory.value === nodeChild.value)
                            {
                                this._selectedTreeNode = nodeChild;
                            }
                        }else {
                            const isNodeChildSelected = !!this._selectedCategories.find(categoryFilter => categoryFilter.value === nodeChild.value);

                            if (this._CategoriesTreeNodesState) {
                                this._CategoriesTreeNodesState.updateNodeState(nodeChild, isNodeChildSelected);
                            }

                            if (isNodeChildSelected) {
                                this._selectedTreeNodes = [...this._selectedTreeNodes, nodeChild];
                            }
                        }

                    });
                }

                return children;
            });
        }
    }

    /**
     * Workaround a complex scenario where changing selection mode leaves
     * some nodes in state relevant only to 'SelfAndChildren'
     */
    public resetNodesState(): void {
        if (this._categoriesTreePropagation) {
            this._categoriesTreePropagation.resetNodesState();
        }
    }

    public _blockTreeSelection(e: MouseEvent): void {
        e.preventDefault();
        e.stopPropagation();
    }

    public expandNode(fullIdPath: number[]): void {
        setTimeout(() => {
            const result = this._findNodeByFullIdPath(fullIdPath);
            if (result) {
                result.expand();
            }
        });
    }

    private _findNodeByFullIdPath(fullIdPath: (number | string)[]): CategoriesTreeNode {
        let result: CategoriesTreeNode = null;
        if (fullIdPath && Array.isArray(fullIdPath)) {
            for (let i = 0, length = fullIdPath.length; i < length; i++) {
                const itemIdToSearchFor = fullIdPath[i];
                result = ((result ? result.children : this._categories) || []).find(child => child.value === itemIdToSearchFor);

                if (!result) {
                    break;
                }
            }
        } else {
            console.warn(`[categories-tree]: trying to find node without providing full id path`);
        }
        return result;
    }
}

