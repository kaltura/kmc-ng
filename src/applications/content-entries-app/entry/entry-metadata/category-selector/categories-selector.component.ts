import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { CategoriesStatusMonitorService, CategoriesStatus } from 'app-shared/content-shared/categories-status/categories-status-monitor.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Subject } from 'rxjs/Subject';
import { AutoComplete, SuggestionsProviderData } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';


import { CategoriesTreeComponent } from 'app-shared/content-shared/categories/categories-tree/categories-tree.component';
import {  TagsComponent } from '@kaltura-ng/kaltura-ui/tags/tags.component';
import { CategoriesSearchService, CategoryData } from "app-shared/content-shared/categories/categories-search.service";


@Component({
  selector: 'kCategoriesSelector',
  templateUrl: './categories-selector.component.html',
  styleUrls: ['./categories-selector.component.scss']
})
export class CategoriesSelector implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('categoriesTree') _categoriesTree: CategoriesTreeComponent;
    @ViewChild('tags') _tags: TagsComponent;
    @ViewChild('autoComplete') private _autoComplete: AutoComplete;

    public _categoriesLoaded = false;
    public _categoriesLocked = false;
    public _categoriesUpdating = false;
    public _treeSelection: number[] = [];

    private _searchCategoriesSubscription: ISubscription;
    public _categoriesProvider = new Subject<SuggestionsProviderData>();
    @Input() buttonLabel = '';
    @Input() set value(value: CategoryData[]) {
        this._selectedCategories = value ? [...value] : [];
        this._treeSelection = value ? [...value.map(item => {
            return item.id;
        })] : [];
    }

    @Output() valueChange = new EventEmitter<CategoryData[]>();

    public _selectedCategories: CategoryData[] = [];

    private parentPopupStateChangeSubscription: ISubscription;
    @Input() parentPopupWidget: PopupWidgetComponent;

    constructor(private _categoriesSearchService: CategoriesSearchService, private cdRef: ChangeDetectorRef, private _appLocalization: AppLocalization, private _categoriesStatusMonitorService: CategoriesStatusMonitorService) {
    }


    ngOnInit() {
        this._categoriesStatusMonitorService.status$
            .cancelOnDestroy(this)
            .subscribe((status: CategoriesStatus) => {
                this._categoriesLocked = status.lock;
                this._categoriesUpdating = status.update;
            });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            if (typeof this._tags !== 'undefined' && this._tags !== null) {
                this._tags.checkShowMore();
            }
        }, 0);
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


    public _apply(): void {

        this.valueChange.emit(this._selectedCategories);

        if (this.parentPopupWidget) {
            this.parentPopupWidget.close({isDirty: true});
        }
    }


    public _removeTag(tag) {
        if (tag && tag.id) {
            const tagIndex = this._selectedCategories.findIndex(item => item.id + '' === tag.id + '');
            if (tagIndex > -1) {
                this._selectedCategories.splice(tagIndex, 1);
            }

            this._treeSelection = this._treeSelection.filter(item => item + '' !== tag.id + '');
        }
    }

    public _removeAllTag() {
        this._selectedCategories = [];
        this._treeSelection = [];
    }

    public _onTreeCategoriesLoad({totalCategories}): void {
        this._categoriesLoaded = totalCategories > 0;

        if (this._categoriesLoaded) {
            this._autoComplete.focusInput();
        }

        this._selectedCategories.forEach((category: CategoryData) => {
            this._categoriesTree.expandNode(category.id);
        });
    }


    public _onAutoCompleteSearch(event): void {
        this._categoriesProvider.next({suggestions: [], isLoading: true});

        if (this._searchCategoriesSubscription) {
            // abort previous request
            this._searchCategoriesSubscription.unsubscribe();
            this._searchCategoriesSubscription = null;
        }

        this._searchCategoriesSubscription = this._categoriesSearchService.getSuggestions(event.query).subscribe(data => {
                const suggestions = [];
                const entryCategories = this._selectedCategories || [];


                (data || []).forEach(suggestedCategory => {
                    const label = suggestedCategory.fullName + (suggestedCategory.referenceId ? ` (${suggestedCategory.referenceId})` : '');

                    const isSelectable = !entryCategories.find(category => {
                        return category.id === suggestedCategory.id;
                    });


                    suggestions.push({name: label, isSelectable: isSelectable, item: suggestedCategory});
                });
                this._categoriesProvider.next({suggestions: suggestions, isLoading: false});
            },
            (err) => {
                this._categoriesProvider.next({
                    suggestions: [],
                    isLoading: false,
                    errorMessage: <any>(err.message || err)
                });
            });
    }

    public _onAutoCompleteSelected(event: any) {

        const selectedItem: CategoryData = this._autoComplete.getValue();

        if (selectedItem && selectedItem.id && selectedItem.fullIdPath && selectedItem.name) {
            const selectedCategoryIndex = this._selectedCategories.findIndex(item => item.id + '' === selectedItem.id + '');

            if (selectedCategoryIndex === -1) {
                this._selectedCategories.push(selectedItem);
            }

            const treeSelectionIndex = this._treeSelection.findIndex(item => item + '' === selectedItem.id + '');

            if (treeSelectionIndex === -1) {
                this._treeSelection = [...this._treeSelection, selectedItem.id];

                this._categoriesTree.expandNode(selectedItem.id);
            }
        }

        // clear user text from component
        this._autoComplete.clearValue();

    }

    public _onCategoryUnselected(node: number) {
        const requestedCategoryIndex = this._selectedCategories.findIndex(item => item.id === node);

        if (requestedCategoryIndex > -1) {
            this._selectedCategories.splice(requestedCategoryIndex, 1);
        }
    }

    public _onCategorySelected(node: number) {
        const requestedCategoryIndex = this._selectedCategories.findIndex(item => item.id === node);

        if (requestedCategoryIndex === -1) {
            const categoryData = this._categoriesSearchService.getCachedCategory(node);

            if (categoryData) {
                this._selectedCategories.push(categoryData);
            }else {
                // TODO sakal
            }
        }
    }
}
