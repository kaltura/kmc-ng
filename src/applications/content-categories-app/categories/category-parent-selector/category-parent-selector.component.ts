import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {ISubscription} from 'rxjs/Subscription';
import {CategoriesTreeNode} from 'app-shared/content-shared/categories-tree/categories-tree-node';
import {Subject} from 'rxjs/Subject';
import {AutoComplete, SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import {
  CategoriesTreeComponent,
  TreeSelectionMode
} from 'app-shared/content-shared/categories-tree/categories-tree.component';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {CategoriesSearchService, CategoryData} from 'app-shared/content-shared/categories-search.service';

@Component({
  selector: 'kCategoryParentSelector',
  templateUrl: './category-parent-selector.component.html',
  styleUrls: ['./category-parent-selector.component.scss']
})
export class CategoryParentSelectorComponent implements OnDestroy, AfterViewChecked, OnInit {

  @Output() onCategorySelected = new EventEmitter<CategoryData>();


  @ViewChild('categoriesTree') _categoriesTree: CategoriesTreeComponent;
  @ViewChild('autoComplete') private _autoComplete: AutoComplete = null;


  private _emptyTreeSelection = new CategoriesTreeNode(null, 'empty', 0, null);

  public _categoriesLoaded = false;
  public _treeSelection: CategoriesTreeNode = null;
  public _selectionTooltip = '';

  private _searchCategoriesSubscription: ISubscription;
  public _categoriesProvider = new Subject<SuggestionsProviderData>();
  public _selectedParentCategory: CategoryData = null;
  private _ngAfterViewCheckedContext: { updateTreeSelections: boolean, expendTreeSelectionNodeId: number } = {
    updateTreeSelections: false,
    expendTreeSelectionNodeId: null
  };

  constructor(private _categoriesSearchService: CategoriesSearchService,
              private cdRef: ChangeDetectorRef,
              private _appLocalization: AppLocalization) {
    this._updateSelectionTooltip();
  }

  ngOnInit() {
  }
  ngOnDestroy() {

    if (this._searchCategoriesSubscription) {
      this._searchCategoriesSubscription.unsubscribe();
      this._searchCategoriesSubscription = null;
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
    const selectionPath = this._selectedParentCategory ? this._selectedParentCategory.fullNamePath : [];
    this._selectionTooltip = this._appLocalization.get(
      'applications.content.categories.selectedCategory',
      { 0: this._createCategoryTooltip(selectionPath) || this._appLocalization.get('applications.content.addNewCategory.noParent') }
    );
  }

  private _updateTreeSelections(expandNodeId = null, initial = false): void {
    let treeSelectedItem = initial ? null : this._emptyTreeSelection;
    // TODO sakal
    //const treeItem = this._categoriesTree.findNodeByFullIdPath(this._selectedParentCategory ? this._selectedParentCategory.fullIdPath : []);
    // if (treeItem) {
    //   treeSelectedItem = treeItem;
    //   if (expandNodeId && this._selectedParentCategory && expandNodeId === this._selectedParentCategory.id) {
    //     treeItem.expand();
    //   }
    // }

    this._treeSelection = treeSelectedItem;
  }

  public _onTreeCategoriesLoad({ categories }: { categories: CategoriesTreeNode[] }): void {
    this._categoriesLoaded = categories && categories.length > 0;
    this._updateTreeSelections(null, true);
  }

  public _createCategoryTooltip(fullNamePath: string[]): string {
    return fullNamePath ? fullNamePath.join(' > ') : null;
  }


  public _onAutoCompleteSearch(event): void {
    this._categoriesProvider.next({ suggestions: [], isLoading: true });

    if (this._searchCategoriesSubscription) {
      // abort previous request
      this._searchCategoriesSubscription.unsubscribe();
      this._searchCategoriesSubscription = null;
    }

    this._searchCategoriesSubscription = this._categoriesSearchService.getSuggestions(event.query).subscribe(data => {
        const suggestions = [];
        const entryCategory = this._selectedParentCategory;


        (data || []).forEach(suggestedCategory => {
          const label = suggestedCategory.fullNamePath.join(' > ') +
              (suggestedCategory.referenceId ?
              ` (${suggestedCategory.referenceId})` : '');

          const isSelectable = !(entryCategory && entryCategory.id === suggestedCategory.id);


          suggestions.push({ name: label, isSelectable: isSelectable, item: suggestedCategory });
        });
        this._categoriesProvider.next({ suggestions: suggestions, isLoading: false });
      },
      (err) => {
        this._categoriesProvider.next({ suggestions: [], isLoading: false, errorMessage: <any>(err.message || err) });
      });
  }

  public _onAutoCompleteSelected() {

    const selectedItem = this._autoComplete.getValue();

    if (selectedItem && selectedItem.id && selectedItem.fullIdPath && selectedItem.name) {
      const relevantCategory = this._selectedParentCategory && String(this._selectedParentCategory.id) === String(selectedItem.id);

      if (!relevantCategory) {
        this._selectedParentCategory =  selectedItem;

        this._ngAfterViewCheckedContext.updateTreeSelections = true;
        this._ngAfterViewCheckedContext.expendTreeSelectionNodeId = selectedItem.id;

        this._updateSelectionTooltip();
        this.onCategorySelected.emit(this._selectedParentCategory);
      }
    }

    // clear user text from component
    this._autoComplete.clearValue();

  }

  public _onTreeNodeSelected(treeNode: CategoriesTreeNode) {
    if (treeNode instanceof CategoriesTreeNode) {
      const relevantCategory = this._selectedParentCategory && this._selectedParentCategory.id === treeNode.value;

      if (!relevantCategory) {
        this._selectedParentCategory = treeNode.origin;
        this._updateSelectionTooltip();
        this.onCategorySelected.emit(this._selectedParentCategory);
      }
    }
  }

  public _clearSelection(): void {
    this._selectedParentCategory = null;
    this._updateSelectionTooltip();
    this.onCategorySelected.emit(this._selectedParentCategory);
  }
}
