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
import {Subject} from 'rxjs/Subject';
import {AutoComplete, SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import {
  CategoriesTreeComponent
} from 'app-shared/content-shared/categories-tree/categories-tree.component';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {CategoriesSearchService} from 'app-shared/content-shared/categories-search.service';
import { CategoriesListItem } from 'app-shared/content-shared/categories/categories-list-type';

@Component({
  selector: 'kCategoryParentSelector',
  templateUrl: './category-parent-selector.component.html',
  styleUrls: ['./category-parent-selector.component.scss']
})
export class CategoryParentSelectorComponent implements OnDestroy, OnInit {

  @Output() onCategorySelected = new EventEmitter<CategoriesListItem>();

  @ViewChild('categoriesTree') _categoriesTree: CategoriesTreeComponent;
  @ViewChild('autoComplete') private _autoComplete: AutoComplete = null;


  public _categoriesLoaded = false;
  public _selectedCategory: CategoriesListItem = null;
  public _selectionTooltip = '';

  private _searchCategoriesSubscription: ISubscription;
  public _categoriesProvider = new Subject<SuggestionsProviderData>();



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

  private _updateSelectionTooltip(): void {
      const tooltip = this._selectedCategory ? this._selectedCategory.tooltip : this._appLocalization.get('applications.content.addNewCategory.noParent');
      this._selectionTooltip = this._appLocalization.get(
          'applications.content.categories.selectedCategory',
          {0: tooltip}
      );
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
        const selectedCategoryValue = this._selectedCategory ? this._selectedCategory.value : null;

        (data || []).forEach(suggestedCategory => {
          const label = suggestedCategory.fullNamePath.join(' > ') +
              (suggestedCategory.referenceId ?
              ` (${suggestedCategory.referenceId})` : '');

          const isSelectable = selectedCategoryValue !== suggestedCategory.id;
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

      // clear user text from component
      this._autoComplete.clearValue();

      if (selectedItem && selectedItem.id && selectedItem.fullIdPath && selectedItem.name) {
this._selectedCategory = {
    value: selectedItem.id,
    label: selectedItem.name,
    fullIdPath: selectedItem.fullIdPath,
    tooltip: (selectedItem.fullNamePath || []).join(' > ')
};
          this.onCategorySelected.emit(this._selectedCategory);

          this._categoriesTree.expandNode(selectedItem.fullIdPath);
          this._updateSelectionTooltip();
      }
  }

  public _onCategorySelected(category: CategoriesListItem) {
      this._selectedCategory = category;
      this._updateSelectionTooltip();
      this.onCategorySelected.emit(this._selectedCategory);
  }

  public _clearSelection(): void {
    this._selectedCategory = null;
    this._updateSelectionTooltip();
    this.onCategorySelected.emit(this._selectedCategory);
  }
}
