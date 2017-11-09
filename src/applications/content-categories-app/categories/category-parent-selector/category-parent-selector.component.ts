import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {ISubscription} from 'rxjs/Subscription';
import {PrimeTreeNode} from '@kaltura-ng/kaltura-primeng-ui';
import {Subject} from 'rxjs/Subject';
import {AutoComplete, SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import {
  CategoriesTreeComponent,
  TreeSelectionMode
} from 'app-shared/content-shared/categories-tree/categories-tree.component';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {KalturaCategory} from 'kaltura-typescript-client/types/KalturaCategory';
import {CategoryParentSelection, CategoriesService} from '../categories.service';
import {CategoriesSearchService, CategoryData} from 'app-shared/content-shared/categories-search.service';

export interface SelectedParentCategory {
  id: number,
  fullIdPath: number[],
  fullNamePath: string[],
  name: string
}


@Component({
  selector: 'kCategoryParentSelector',
  templateUrl: './category-parent-selector.component.html',
  styleUrls: ['./category-parent-selector.component.scss']
})
export class CategoryParentSelectorComponent implements OnDestroy, AfterViewChecked, OnInit {
  @Input() mode: 'move' | 'new' = 'move';
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() categoryToMove: KalturaCategory;
  @Output() onCategorySelected = new EventEmitter<CategoryParentSelection>();


  @ViewChild('categoriesTree') _categoriesTree: CategoriesTreeComponent;
  @ViewChild('autoComplete') private _autoComplete: AutoComplete = null;

  public _isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;
  private _emptyTreeSelection = new PrimeTreeNode(null, 'empty', 0, null);
  public _selectionMode: TreeSelectionMode = 'single';
  public _categoriesLoaded = false;
  public _treeSelection: PrimeTreeNode = null;
  public _selectionTooltip = '';

  private _searchCategoriesSubscription: ISubscription;
  public _categoriesProvider = new Subject<SuggestionsProviderData>();
  public _selectedParentCategory: CategoryData = null;
  public newCategoryForm: FormGroup;

  private parentPopupStateChangeSubscription: ISubscription;

  private _ngAfterViewCheckedContext: { updateTreeSelections: boolean, expendTreeSelectionNodeId: number } = {
    updateTreeSelections: false,
    expendTreeSelectionNodeId: null
  };

  constructor(private _categoriesSearchService: CategoriesSearchService,
              private _categoriesService: CategoriesService,
              private cdRef: ChangeDetectorRef,
              private _appLocalization: AppLocalization,
              private _fb: FormBuilder) {
    this._updateSelectionTooltip();
  }

  ngOnInit() {
    if (this.mode === 'new') {
      this.newCategoryForm = this._fb.group({
        name: ['', Validators.required]
      });
    } else if (this.mode === 'move' && !this.categoryToMove) {
      console.warn('CategoryParentSelectorComponent: move category was selected without setting category Id to move');
    }
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
    const selectionPath = this._selectedParentCategory ? this._selectedParentCategory.fullNamePath : [];
    this._selectionTooltip = this._appLocalization.get(
      'applications.content.categories.selectedCategory',
      { 0: this._createCategoryTooltip(selectionPath) || this._appLocalization.get('applications.content.addNewCategory.noParent') }
    );
  }

  private _updateTreeSelections(expandNodeId = null, initial = false): void {
    let treeSelectedItem = initial ? null : this._emptyTreeSelection;
    const treeItem = this._categoriesTree.findNodeByFullIdPath(this._selectedParentCategory ? this._selectedParentCategory.fullIdPath : []);
    if (treeItem) {
      treeSelectedItem = treeItem;
      if (expandNodeId && this._selectedParentCategory && expandNodeId === this._selectedParentCategory.id) {
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
        if (this._selectedParentCategory && this._selectedParentCategory.id === attachedCategory.data) {
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

    this._searchCategoriesSubscription = this._categoriesSearchService.getSuggestions(event.query).subscribe(data => {
        const suggestions = [];
        const entryCategory = this._selectedParentCategory;


        (data.items || []).forEach(suggestedCategory => {
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

  public _onAutoCompleteSelected() {

    const selectedItem = this._autoComplete.getValue();

    if (selectedItem && selectedItem.id && selectedItem.fullIdPath && selectedItem.name) {
      const relevantCategory = this._selectedParentCategory && String(this._selectedParentCategory.id) === String(selectedItem.id);

      if (!relevantCategory) {
        this._selectedParentCategory =  selectedItem;

        this._ngAfterViewCheckedContext.updateTreeSelections = true;
        this._ngAfterViewCheckedContext.expendTreeSelectionNodeId = selectedItem.id;

        this._updateSelectionTooltip();
      }
    }

    // clear user text from component
    this._autoComplete.clearValue();

  }

  public _onTreeNodeSelected(treeNode: PrimeTreeNode) {
    if (treeNode instanceof PrimeTreeNode) {
      const relevantCategory = this._selectedParentCategory && String(this._selectedParentCategory.id) === String(treeNode.data);

      if (!relevantCategory) {
        this._selectedParentCategory = treeNode.origin;
        this._updateSelectionTooltip();
      }
    }
  }

  public _clearSelection(): void {
    this._selectedParentCategory = null;
    this._updateSelectionTooltip();
  }

  public _apply(): void {
    this._isBusy = true;

    const categoryParent = this._selectedParentCategory;

    if (this.mode === 'new') { // 'new' mode
      this._createNewCategory(categoryParent);
    } else {
      this._moveCategory(categoryParent);
    }
  }

  private _moveCategory(categoryParent: SelectedParentCategory) {
    if (!categoryParent && !this.categoryToMove.parentId || categoryParent && this.categoryToMove.parentId === categoryParent.id) {
      // if category moved to the same parent or to 'no parent' as it was before
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.moveCategory.errors.categoryAlreadyBelongsToParent'),
        buttons: [
          {
            label: this._appLocalization.get('app.common.cancel'),
            action: () => {
              this._isBusy = false;
              this._blockerMessage = null;
            }
          }
        ]
      });
    } else if (categoryParent && !this._categoriesService.isParentCategorySelectionValid(this.categoryToMove.id, categoryParent.id, categoryParent.fullIdPath)) {
      // if trying to move category be a child of itself or one of its children show error message
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.moveCategory.errors.invalidParentSelection'),
        buttons: [
          {
            label: this._appLocalization.get('app.common.cancel'),
            action: () => {
              this._isBusy = false;
              this._blockerMessage = null;
            }
          }
        ]
      });
    } else {
      this.onCategorySelected.emit({categoryId: this.categoryToMove.id, categoryParentId: categoryParent.id});
      if (this.parentPopupWidget) {
        this.parentPopupWidget.close();
      }
    }
  }


  private _createNewCategory(categoryParent: SelectedParentCategory) {
    const categoryName = this.newCategoryForm.controls['name'].value;
    if (!categoryName || !categoryName.length) {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.addNewCategory.errors.requiredName'),
        buttons: [
          {
            label: this._appLocalization.get('app.common.cancel'),
            action: () => {
              this._isBusy = false;
              this._blockerMessage = null;
            }
          }
        ]
      });
    } else {
      this.onCategorySelected.emit({categoryParentId: categoryParent.id, name: categoryName});
      if (this.parentPopupWidget) {
        this.parentPopupWidget.close();
      }
    }
  }

  public _cancel(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }
}
