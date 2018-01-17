import {
  AfterViewChecked,
  AfterViewInit,
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


import { Subject } from 'rxjs/Subject';
import {AutoComplete, SuggestionsProviderData } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { EntryCategoryItem } from '../entry-metadata-widget.service';

import { CategoriesTreeComponent } from 'app-shared/content-shared/categories/categories-tree/categories-tree.component';
import {  TagsComponent } from '@kaltura-ng/kaltura-ui/tags/tags.component';import {CategoriesSearchService} from "app-shared/content-shared/categories/categories-search.service";


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
    public _treeSelection: number[] = [];

    private _searchCategoriesSubscription: ISubscription;
    public _categoriesProvider = new Subject<SuggestionsProviderData>();
    @Input() buttonLabel = '';
    @Input() set value(value: EntryCategoryItem[]) {
        this._selectedCategories = value ? [...value] : [];
        this._treeSelection = value ? [...value.map(item => {
            return item.id;
        })] : [];
    }

    @Output() valueChange = new EventEmitter<EntryCategoryItem[]>();

    public _selectedCategories: EntryCategoryItem[] = [];

    private parentPopupStateChangeSubscription: ISubscription;
    @Input() parentPopupWidget: PopupWidgetComponent;

    constructor(private _categoriesSearchService: CategoriesSearchService, private cdRef: ChangeDetectorRef) {
    }


    ngOnInit() {

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
                    const label = suggestedCategory.fullNamePath.join(' > ') + (suggestedCategory.referenceId ? ` (${suggestedCategory.referenceId})` : '');

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

        const selectedItem = this._autoComplete.getValue();

        if (selectedItem && selectedItem.id && selectedItem.fullIdPath && selectedItem.name) {
            const selectedCategoryIndex = this._selectedCategories.findIndex(item => item.id + '' === selectedItem.id + '');

            if (selectedCategoryIndex === -1) {
                this._selectedCategories.push({
                    id: selectedItem.id,
                    fullIdPath: selectedItem.fullIdPath,
                    name: selectedItem.name,
                    tooltip: selectedItem.tooltip
                });
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

    public _onTreeNodeUnselected(node: number) {
        const autoCompleteItemIndex = this._selectedCategories.findIndex(item => item.id === node);

        if (autoCompleteItemIndex > -1) {
            this._selectedCategories.splice(autoCompleteItemIndex, 1);
        }
    }

    public _onTreeNodeSelected(node: number) {
        const autoCompleteItemIndex = this._selectedCategories.findIndex(item => item.id === node);


        if (autoCompleteItemIndex === -1) {
            // TODO sakal
            //this._selectedCategories.push(node.value);
        }
    }
}
