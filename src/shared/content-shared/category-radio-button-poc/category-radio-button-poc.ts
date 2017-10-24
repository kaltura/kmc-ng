import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import { PrimeTreeNode } from '@kaltura-ng/kaltura-primeng-ui';
import { Subject } from 'rxjs/Subject';
import { AutoComplete, SuggestionsProviderData } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { CategoriesTreeComponent, TreeSelectionMode } from 'app-shared/content-shared/categories-tree/categories-tree.component';
import { CategoriesPrimeService } from 'app-shared/content-shared/categories-prime.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kCategoryRadioButtonPOC',
  templateUrl: './category-radio-button-poc.html',
  styleUrls: ['./category-radio-button-poc.scss']
})
export class CategoryRadioButtonPocComponent implements OnDestroy, AfterViewChecked {
  @Input() value: any = null;

  @ViewChild('categoriesTree') _categoriesTree: CategoriesTreeComponent;
  @ViewChild('autoComplete') private _autoComplete: AutoComplete = null;

  private _emptyTreeSelection = new PrimeTreeNode(null, 'empty', 0, null);
  public _selectionMode: TreeSelectionMode = 'single';
  public _categoriesLoaded = false;
  public _treeSelection: PrimeTreeNode = null;
  public _selectionTooltip = '';

  private _searchCategoriesSubscription: ISubscription;
  public _categoriesProvider = new Subject<SuggestionsProviderData>();
  public _selectedCategory: any = null;

  private parentPopupStateChangeSubscription: ISubscription;

  private _ngAfterViewCheckedContext: { updateTreeSelections: boolean, expendTreeSelectionNodeId: number } = {
    updateTreeSelections: false,
    expendTreeSelectionNodeId: null
  };

  constructor(private _categoriesPrimeService: CategoriesPrimeService,
              private cdRef: ChangeDetectorRef,
              private _appLocalization: AppLocalization) {
    this._updateSelectionTooltip();
  }

  ngOnDestroy() {

    if (this._searchCategoriesSubscription) {
      this._searchCategoriesSubscription.unsubscribe();
      this._searchCategoriesSubscription = null;
    }

    if (this.parentPopupStateChangeSubscription) {
      this.parentPopupStateChangeSubscription.unsubscribe();
      this.parentPopupStateChangeSubscription = null;
    }
  }

  ngAfterViewChecked() {
    if (this._ngAfterViewCheckedContext.updateTreeSelections) {
      this._updateTreeSelections(this._ngAfterViewCheckedContext.expendTreeSelectionNodeId);

      this._ngAfterViewCheckedContext.expendTreeSelectionNodeId = null;
      this._ngAfterViewCheckedContext.updateTreeSelections = false;
      this.cdRef.detectChanges();
    }
  }

  private _updateSelectionTooltip(): void {
    const selectionPath = this._selectedCategory ? this._selectedCategory.fullNamePath : '';
    this._selectionTooltip = this._appLocalization.get(
      'applications.content.categories.selectedCategory',
      { 0: this._createCategoryTooltip(selectionPath) || 'no parent' }
    );
  }

  private _updateTreeSelections(expandNodeId = null, initial = false): void {
    let treeSelectedItem = initial ? null : this._emptyTreeSelection;
    const treeItem = this._categoriesTree.findNodeByFullIdPath(this._selectedCategory ? this._selectedCategory.fullIdPath : []);
    if (treeItem) {
      treeSelectedItem = treeItem;
      if (expandNodeId && this._selectedCategory && expandNodeId === this._selectedCategory.id) {
        treeItem.expand();
      }
    }

    this._treeSelection = treeSelectedItem;
  }

  public _onTreeCategoriesLoad({ categories }: { categories: PrimeTreeNode[] }): void {
    this._categoriesLoaded = categories && categories.length > 0;
    this._updateTreeSelections(null, true);
  }

  public _createCategoryTooltip(fullNamePath: string[]): string {
    return fullNamePath ? fullNamePath.join(' > ') : null;
  }

  public _onTreeNodeChildrenLoaded({ node }) {
    if (node instanceof PrimeTreeNode) {
      let selectedNode: PrimeTreeNode = null;

      node.children.forEach((attachedCategory) => {
        if (this._selectedCategory && this._selectedCategory.id === attachedCategory.data) {
          selectedNode = attachedCategory;
        }
      });

      if (selectedNode) {
        this._treeSelection = selectedNode;
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
        const entryCategory = this._selectedCategory;


        (data || []).forEach(suggestedCategory => {
          const label = suggestedCategory.fullNamePath.join(' > ') + (suggestedCategory.referenceId ? ` (${suggestedCategory.referenceId})` : '');

          const isSelectable = !(entryCategory && entryCategory.id === suggestedCategory.id);


          suggestions.push({ name: label, isSelectable: isSelectable, item: suggestedCategory });
        });
        this._categoriesProvider.next({ suggestions: suggestions, isLoading: false });
      },
      (err) => {
        this._categoriesProvider.next({ suggestions: [], isLoading: false, errorMessage: <any>(err.message || err) });
      });
  }

  public _onAutoCompleteSelected(event: any) {

    const selectedItem = this._autoComplete.getValue();

    if (selectedItem && selectedItem.id && selectedItem.fullIdPath && selectedItem.name) {
      const relevantCategory = this._selectedCategory && String(this._selectedCategory.id) === String(selectedItem.id);

      if (!relevantCategory) {
        this._selectedCategory = {
          id: selectedItem.id,
          fullIdPath: selectedItem.fullIdPath,
          fullNamePath: selectedItem.fullNamePath,
          name: selectedItem.name
        };

        this._ngAfterViewCheckedContext.updateTreeSelections = true;
        this._ngAfterViewCheckedContext.expendTreeSelectionNodeId = selectedItem.id;

        this._updateSelectionTooltip();
      }
    }

    // clear user text from component
    this._autoComplete.clearValue();

  }

  public _onTreeNodeSelected({ node }: { node: any }) {
    if (node instanceof PrimeTreeNode) {
      const relevantCategory = this._selectedCategory && String(this._selectedCategory.id) === String(node.data);

      if (!relevantCategory) {
        this._selectedCategory = {
          id: node.origin.id,
          fullIdPath: node.origin.fullIdPath,
          fullNamePath: node.origin.fullNamePath,
          name: node.origin.name
        };

        this._updateSelectionTooltip();
      }
    }
  }

  public _clearSelection(): void {
    this._selectedCategory = null;
    this._updateSelectionTooltip();
  }
}
