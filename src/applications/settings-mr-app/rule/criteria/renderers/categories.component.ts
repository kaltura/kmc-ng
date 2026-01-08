import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {CategoriesSearchService, CategoryData} from 'app-shared/content-shared/categories/categories-search.service';
import {CategoryTooltipPipe} from 'app-shared/content-shared/categories/category-tooltip.pipe';
import {Observable, Subject} from 'rxjs';
import {SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui';
import {ISubscription} from 'rxjs/Subscription';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {AppAnalytics, ButtonType} from 'app-shared/kmc-shell';
import {KalturaMediaEntryFilter} from 'kaltura-ngx-client';

@Component({
    selector: 'kCriteriaCategories',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="criteria">
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.criteria.header' | translate}}</span>
                <span class="kLabelWithHelpTip">{{'applications.settings.mr.criteria.categories' | translate}}</span>
                <kInputHelper>
                    <span>{{'applications.settings.mr.criteria.published_tt' | translate}}</span>
                </kInputHelper>
            </div>

            <div class="kRow kCenter">
                <span class="kLabel">{{'applications.settings.mr.criteria.categories' | translate}}</span>
                <div class="kRow">
                    <p-dropdown [options]="_publishOptions" [style]="{'width':'150px', 'margin-right': '16px'}" [(ngModel)]="_published" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                    <div class="kCol">
                        <kAutoComplete [(ngModel)]="categories"
                                       (ngModelChange)="onCriteriaChange()"
                                       field="name"
                                       suggestionItemField="item"
                                       suggestionLabelField="name"
                                       suggestionSelectableField="isSelectable"
                                       [allowMultiple]="true"
                                       [tooltipResolver]="_categoriesTooltipResolver"
                                       [minLength]="3"
                                       [suggestionsProvider]="_categoriesProvider"
                                       (completeMethod)="_searchCategories($event)">
                        </kAutoComplete>
                        <a (click)="categoriesPopup.open()" class="kLink">
                            {{'applications.content.entryDetails.metadata.browse' | translate}}
                        </a>
                        <p-checkbox *ngIf="_published === 'categoriesIdsMatchOr'" class="kCheckbox" label="{{'applications.settings.mr.criteria.subcategories' | translate}}" [(ngModel)]="_includeSubCategories" (onChange)="onCriteriaChange()" binary="true"></p-checkbox>
                    </div>
                </div>
            </div>

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>
        <kPopupWidget #categoriesPopup data-aid="categoriesPopup" [popupWidth]="560" [popupHeight]="586" [closeBtn]="true" [modal]="true">
            <ng-template>
                <kCategoriesSelector [parentPopupWidget]="categoriesPopup" (valueChange)="_updateCategories($event)"
                                     [value]="categories"
                                     [buttonLabel]="'applications.content.entryDetails.metadata.addCategories' | translate"></kCategoriesSelector>
            </ng-template>
        </kPopupWidget>
    `
})
export class CriteriaCategoriesComponent implements OnDestroy{

    public categories: CategoryData[] = [];
    public _publishOptions: { value: string, label: string }[] = [
        {value: 'categoriesIdsMatchOr', label: this._appLocalization.get('applications.settings.mr.criteria.published')},
        {value: 'categoriesIdsNotContains', label: this._appLocalization.get('applications.settings.mr.criteria.notPublished')}
    ];
    public _published = 'categoriesIdsMatchOr';
    public _includeSubCategories = false;

    private _filter: KalturaMediaEntryFilter;

    @Input() set filter(value: KalturaMediaEntryFilter) {
        if (value && (value['categoriesIdsMatchOr'] || value['categoriesIdsNotContains'] || value['categoryAncestorIdIn'])) {
            this._published = value['categoriesIdsMatchOr'] || value['categoryAncestorIdIn'] ? 'categoriesIdsMatchOr' : 'categoriesIdsNotContains'; // set dropdown value
            this._includeSubCategories = !!value.categoryAncestorIdIn;
            // load categories from their IDs
            const categoriesFilter = value['categoriesIdsMatchOr'] ? value['categoriesIdsMatchOr'].split(',') : value['categoryAncestorIdIn'] ? value['categoryAncestorIdIn'].split(',') : value['categoriesIdsNotContains'].split(',') ;
            const categoryIDs: number[] = [];
            categoriesFilter.forEach(id => categoryIDs.push(parseInt(id)));
            this._categoriesSearchService.getCategories(categoryIDs).subscribe(response => {
                this.categories = response?.items ? response.items : [];
            },
            error => {
                    console.error("Error loading categories ", error);
            })
        }
        this._filter = value;
    }
    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<KalturaMediaEntryFilter>();

    private _categoriesTooltipPipe: CategoryTooltipPipe;
    private _searchCategoriesSubscription : ISubscription;
    public _categoriesTooltipResolver = (value: any) => {
        return this._categoriesTooltipPipe.transform(value);
    };
    public _categoriesProvider = new Subject<SuggestionsProviderData>();

    constructor(private _appLocalization: AppLocalization,
                private _analytics: AppAnalytics,
                private _categoriesSearchService : CategoriesSearchService) {
        this._categoriesTooltipPipe  = new CategoryTooltipPipe(this._appLocalization);
    }

    _updateCategories($event : any) : void {
        if ($event && $event instanceof Array)
        {
            this.categories = $event;
            this.onCriteriaChange();
        }
    }

    public onCriteriaChange(): void {
        const cats = [];
        delete this._filter['categoriesIdsMatchOr'];
        delete this._filter['categoriesIdsNotContains'];
        delete this._filter['categoryAncestorIdIn'];
        this.categories.forEach(category => cats.push(category.id));
        if (this._includeSubCategories && this._published === 'categoriesIdsMatchOr') {
            this._filter['categoryAncestorIdIn'] = cats.toString();
        } else {
            this._filter[this._published] = cats.toString();
        }
        this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_categories_type', this._published === 'categoriesIdsMatchOr' ? 'Published_in' : 'not_published_in' , 'Automation_manager');
        this.onFilterChange.emit(this._filter);
    }

    public delete(): void {
        delete this._filter['categoriesIdsMatchOr'];
        delete this._filter['categoriesIdsNotContains'];
        delete this._filter['categoryAncestorIdIn'];
        this.onFilterChange.emit(this._filter);
        this.onDelete.emit('categories');
    }

    private searchCategories(text : string) {
        return Observable.create(
            observer => {

                const requestSubscription = this._categoriesSearchService.getSuggestions(text)
                    .pipe(cancelOnDestroy(this))
                    .subscribe(
                        result =>
                        {
                            observer.next(result);
                            observer.complete();
                        },
                        err =>
                        {
                            observer.error(err);
                        }
                    );

                return () =>
                {
                    requestSubscription.unsubscribe();
                }
            });
    }

    public _searchCategories(event) : void {
        this._categoriesProvider.next({ suggestions : [], isLoading : true});

        if (this._searchCategoriesSubscription)
        {
            // abort previous request
            this._searchCategoriesSubscription.unsubscribe();
            this._searchCategoriesSubscription = null;
        }

        this._searchCategoriesSubscription = this.searchCategories(event.query).subscribe(data => {
                const suggestions = [];
                const entryCategories = this.categories || [];


                (data|| []).forEach(suggestedCategory => {
                    const label = suggestedCategory.fullName + (suggestedCategory.referenceId ? ` (${suggestedCategory.referenceId})` : '');

                    const isSelectable = !entryCategories.find(category => {
                        return category.id === suggestedCategory.id;
                    });


                    suggestions.push({ name: label, isSelectable: isSelectable, item : suggestedCategory});
                });
                this._categoriesProvider.next({suggestions: suggestions, isLoading: false});
            },
            (err) => {
                this._categoriesProvider.next({ suggestions : [], isLoading : false, errorMessage : <any>(err.message || err)});
            });
    }

    ngOnDestroy() {
        this._categoriesProvider.complete();
        if (this._searchCategoriesSubscription) {
            this._searchCategoriesSubscription.unsubscribe();
        }
    }
}
