import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
export class CategoriesTreeComponent implements OnInit {

  @Input() public disablePropagation = false;
  @Input() autoLoad = true;

    @Input() public set selection(value: CategoriesListItem[])
    {
        this._selectedCategories = value;
        this._syncTreeSelections();
    }

    @Output() public categoriesChange = new EventEmitter<CategoriesListItem[]>();

  public _treeSelection: CategoriesTreeNode[] = [];

    private _selectedCategories: CategoriesListItem[];

    @Input()
  set selectionMode(value: TreeSelectionMode) {
        this._selectionMode = value === 'single' ? value : 'multiple';
    }

    // TODO SAKAL remove
  @Output() onCategoriesLoaded = new EventEmitter<{ categories: CategoriesTreeNode[] }>();

  @Output() onCategorySelected: EventEmitter<CategoriesListItem> = new EventEmitter();
  @Output() onCategoryUnselected: EventEmitter<CategoriesListItem> = new EventEmitter();

  @ViewChild(CategoriesTreePropagationDirective) _CategoriesTreeNodesState: CategoriesTreePropagationDirective;
    public _categories: CategoriesTreeNode[] = [];

  private inLazyMode = false;
  public _loading = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _selectionMode: TreeSelectionMode = 'multiple';
  public _selectionModes = {
    'multiple': 'multiple',
    'single': 'single'
  };


  private updateNodeState(node: CategoriesTreeNode, addToSelection: boolean): void {
    this._CategoriesTreeNodesState.updateNodeState(node, addToSelection);
  }

  public get categories(): CategoriesTreeNode[] {
    return this._categories;
  }

  constructor(private _categoriesTreeService: CategoriesTreeService,
              private _appAuthentication: AppAuthentication,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this.inLazyMode = this._appAuthentication.appUser.permissionsFlags.indexOf('DYNAMIC_FLAG_KMC_CHUNKED_CATEGORY_LOAD') !== -1;

    if (this.autoLoad) {
      this._loadCategories();
    }
  }

    private _syncTreeSelections() {
        const listSelectionsMap = FiltersUtils.toMap(this._treeSelection, 'data');
        const listFilterMap = FiltersUtils.toMap(this._selectedCategories || [], 'value');
        const diff = FiltersUtils.getDiff(listSelectionsMap, listFilterMap);

        diff.added.forEach(item => {
            const nodeOfFilter = this.findNodeByFullIdPath(item.fullIdPath);

            if (nodeOfFilter) {
                // update selection of tree - handle situation when the node was added by auto-complete
                if (this._treeSelection.indexOf(nodeOfFilter) === -1) {
                    // IMPORTANT - we create a new array and not altering the existing one due to out-of-sync issue with angular binding.
                    this._treeSelection = [...this._treeSelection, nodeOfFilter];
                }
            }
        });

        diff.deleted.forEach(removedItem => {
            this._treeSelection.splice(
                this._treeSelection.indexOf(removedItem),
                1
            );
        });

    }

    private _convertToCategory(node: CategoriesTreeNode): CategoriesListItem {

        return {
            value: node.data + '', label: node.label,
            fullIdPath: node.origin.fullIdPath,
            tooltip: (node.origin.fullNamePath || []).join(' > ')
        };
    }


    public _onNodeSelect({node}){
      this.onCategorySelected.emit(this._convertToCategory(node));
    }

    public _onNodeUnselect({node}){
      this.onCategoryUnselected.emit(this._convertToCategory(node));
    }


  private _loadCategories(): void {
    this._loading = true;
    this._blockerMessage = null;
    this._categoriesTreeService.getCategories()
      .subscribe(result => {
          this._categories = result.categories;
          this._loading = false;

          this._syncTreeSelections();

          this.onCategoriesLoaded.emit({ categories: this._categories });
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
          if (node instanceof CategoriesTreeNode) {
            node.children.forEach(nodeChild => {
              const isNodeChildSelected = !!this._selectedCategories.find(categoryFilter => categoryFilter.value + '' === nodeChild.data + '');
              this.updateNodeState(nodeChild, isNodeChildSelected);

              if (isNodeChildSelected)
              {
                this._treeSelection.push(node);
              }

            });
          }

        return children;
      });
    }
  }

  public _blockTreeSelection(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  public findNodeByFullIdPath(fullIdPath: (number | string)[]): CategoriesTreeNode {
    // find the item in the tree (if exists)
    let result: CategoriesTreeNode = null;
    for (let i = 0, length = fullIdPath.length; i < length; i++) {
      const itemIdToSearchFor = fullIdPath[i];
      result = ((result ? result.children : this._categories) || []).find(child => child.data + '' === itemIdToSearchFor + '');

      if (!result) {
        break;
      }
    }

    return result;
  }

  public clearSelection(): void {
    let resetValue = [];

    if (this._selectionMode === 'single') {
      resetValue = null;
    }else
    {
        // TODO sakal
        //this._treeSelection = [];
    }
  }
}

