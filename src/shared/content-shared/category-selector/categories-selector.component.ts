import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { PrimeTreeNode } from '@kaltura-ng/kaltura-primeng-ui';
import { AutoComplete, SuggestionsProviderData } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

import { CategoriesTreeComponent } from 'app-shared/content-shared/categories-tree/categories-tree.component';
import { CategoriesPrimeService } from 'app-shared/content-shared/categories-prime.service';

export enum CategorySelectionMode {
  single,
  multi
}

export interface EntryCategoryItem {
  id: number,
  fullIdPath: number[],
  name: string,
  fullNamePath: string[],
}

@Component({
  selector: 'kCategoriesSelector',
  templateUrl: './categories-selector.component.html',
  styleUrls: ['./categories-selector.component.scss']
})
export class CategoriesSelectorComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() buttonLabel = '';
  @Input() value = [];

  @Input()
  set selectionMode(value: CategorySelectionMode) {
    if ([CategorySelectionMode.multi, CategorySelectionMode.single].includes(value)) {
      this._selectionModeStyle = CategorySelectionMode.multi === value ? 'kCategoriesMultiSelect' : 'kCategoriesSingleSelect';
      this._selectionMode = value;
    } else {
      this._selectionModeStyle = 'kCategoriesMultiSelect';
      this._selectionMode = CategorySelectionMode.multi;
      console.warn('Unknown selection mode was passed. Set to multiple mode by default');
    }
  }

  @Output() onSelectionUpdate = new EventEmitter<EntryCategoryItem | EntryCategoryItem[]>();

  @ViewChild('categoriesTree') _categoriesTree: CategoriesTreeComponent;
  @ViewChild('autoComplete') _autoComplete: AutoComplete = null;

  private _selectionMode = CategorySelectionMode.multi;
  private _searchCategoriesSubscription: ISubscription;
  private _parentPopupStateChangeSubscription: ISubscription;
  private _ngAfterViewCheckedContext: { updateTreeSelections: boolean, expendTreeSelectionNodeId: number } = {
    updateTreeSelections: false,
    expendTreeSelectionNodeId: null
  };

  public _selectionModeStyle = 'kCategoriesMultiSelect';
  public _categoriesLoaded = false;
  public _treeSelection: PrimeTreeNode[] = [];
  public _categoriesProvider = new Subject<SuggestionsProviderData>();
  public _selectedCategories = [];

  constructor(private _categoriesPrimeService: CategoriesPrimeService, private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this._selectedCategories = Array.isArray(this.value) ? [...this.value] : this.value ? [this.value] : [];
  }

  ngAfterViewChecked() {
    if (this._ngAfterViewCheckedContext.updateTreeSelections) {
      this._updateTreeSelections(this._ngAfterViewCheckedContext.expendTreeSelectionNodeId);

      this._ngAfterViewCheckedContext.expendTreeSelectionNodeId = null;
      this._ngAfterViewCheckedContext.updateTreeSelections = false;
      this.cdRef.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this._searchCategoriesSubscription) {
      this._searchCategoriesSubscription.unsubscribe();
      this._searchCategoriesSubscription = null;
    }

    if (this._parentPopupStateChangeSubscription) {
      this._parentPopupStateChangeSubscription.unsubscribe();
      this._parentPopupStateChangeSubscription = null;
    }
  }

  private _sendUpdateSelection(): void {
    const selection = this._selectionMode === CategorySelectionMode.multi ? this._selectedCategories : this._selectedCategories[0];
    this.onSelectionUpdate.emit(selection);
  }

  private _updateTreeSelections(expandNodeId = null): void {
    const treeSelectedItems = [];

    this._selectedCategories.forEach(category => {
      const treeItem = this._categoriesTree.findNodeByFullIdPath(category.fullIdPath);

      if (treeItem) {
        treeSelectedItems.push(treeItem);
        if (expandNodeId && expandNodeId === category.id) {
          treeItem.expand();
        }
      }
    });

    this._treeSelection = treeSelectedItems;
  }

  public _onTreeCategoriesLoad({ categories }: { categories: PrimeTreeNode[] }): void {
    this._categoriesLoaded = categories && categories.length > 0;
    this._updateTreeSelections();
  }

  public _onTreeNodeChildrenLoaded({ node }): void {
    if (node instanceof PrimeTreeNode) {
      const selectedNodes: PrimeTreeNode[] = [];

      node.children.forEach((attachedCategory) => {
        if (this._selectedCategories.find(category => category.id === attachedCategory.data)) {
          selectedNodes.push(attachedCategory);
        }
      });

      if (selectedNodes.length) {
        this._treeSelection = [...this._treeSelection || [], ...selectedNodes];
      }
    }
  }

  public _onAutoCompleteSearch(event): void {
    this._categoriesProvider.next({ suggestions: [], isLoading: true });

    if (this._searchCategoriesSubscription) {
      // abort previous request
      this._searchCategoriesSubscription.unsubscribe();
      this._searchCategoriesSubscription = null;
    }

    this._searchCategoriesSubscription = this._categoriesPrimeService.searchCategories(event.query).subscribe(data => {
        const suggestions = [];
        const entryCategories = this._selectedCategories || [];


        (data || []).forEach(suggestedCategory => {
          const label = suggestedCategory.fullNamePath.join(' > ') + (suggestedCategory.referenceId ? ` (${suggestedCategory.referenceId})` : '');

          const isSelectable = !entryCategories.find(category => {
            return category.id === suggestedCategory.id;
          });


          suggestions.push({ name: label, isSelectable: isSelectable, item: suggestedCategory });
        });
        this._categoriesProvider.next({ suggestions: suggestions, isLoading: false });
      },
      (err) => {
        this._categoriesProvider.next({ suggestions: [], isLoading: false, errorMessage: <any>(err.message || err) });
      });
  }

  public _onAutoCompleteSelected(): void {
    const selectedItem = this._autoComplete.getValue();

    if (selectedItem && selectedItem.id && selectedItem.fullIdPath && selectedItem.name) {
      const selectedCategoryIndex = this._selectedCategories.findIndex(item => item.id + '' === selectedItem.id + '');

      if (selectedCategoryIndex === -1) {
        if (this._selectionMode === CategorySelectionMode.single) {
          this._selectedCategories = [];
        }

        this._selectedCategories.push({
          id: selectedItem.id,
          fullIdPath: selectedItem.fullIdPath,
          fullNamePath: selectedItem.fullNamePath,
          name: selectedItem.name
        });

        this._ngAfterViewCheckedContext.updateTreeSelections = true;
        this._ngAfterViewCheckedContext.expendTreeSelectionNodeId = selectedItem.id;

        this._sendUpdateSelection();
      }
    }

    // clear user text from component
    this._autoComplete.clearValue();
  }

  public _onTreeNodeUnselected({ node }: { node: PrimeTreeNode }) {
    if (node instanceof PrimeTreeNode) {
      const autoCompleteItemIndex = this._selectedCategories.findIndex(item => item.id + '' === node.data + '');

      if (autoCompleteItemIndex > -1) {
        this._selectedCategories.splice(autoCompleteItemIndex, 1);

        this._sendUpdateSelection();
      }
    }
  }

  public _onTreeNodeSelected({ node }: { node: any }): void {
    if (node instanceof PrimeTreeNode) {
      const autoCompleteItemIndex = this._selectedCategories.findIndex(item => item.id + '' === node.data + '');

      if (this._selectionMode === CategorySelectionMode.single) {
        this._treeSelection = [node];
      }

      if (autoCompleteItemIndex === -1) {
        if (this._selectionMode === CategorySelectionMode.single) {
          this._selectedCategories = [];
        }

        this._selectedCategories.push({
          id: node.origin.id,
          fullIdPath: node.origin.fullIdPath,
          fullNamePath: node.origin.fullNamePath,
          name: node.origin.name
        });

        this._sendUpdateSelection();
      }
    }
  }

  public clearSelection(): void {
    this._treeSelection = [];
    this._selectedCategories = [];
    this._sendUpdateSelection();
  }

  public removeSelection(tag: EntryCategoryItem): void {
    if (tag && tag.id) {
      const tagIndex = this._selectedCategories.findIndex(item => item.id + '' === tag.id + '');

      if (tagIndex > -1) {
        this._selectedCategories.splice(tagIndex, 1);
        this._updateTreeSelections();
        this._sendUpdateSelection();
      }

    }
  }
}





