import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {CategoriesSearchService, CategoryData} from 'app-shared/content-shared/categories/categories-search.service';
import {CategoryTooltipPipe} from 'app-shared/content-shared/categories/category-tooltip.pipe';
import {Observable, Subject} from 'rxjs';
import {SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui';
import {ISubscription} from 'rxjs/Subscription';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {AppLocalization} from '@kaltura-ng/mc-shared';

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

    @Input() set filter(value: any) {
        if (value && (value['categoriesIdsMatchOr'] || value['categoriesIdsNotContains'])) {
            this._published = value['categoriesIdsMatchOr'] ? 'categoriesIdsMatchOr' : 'categoriesIdsNotContains'; // set dropdown value
            // load categories from their IDs
            const categoriesFilter = value['categoriesIdsMatchOr'] ? value['categoriesIdsMatchOr'].split(',') : value['categoriesIdsNotContains'].split(',') ;
            const categoryIDs: number[] = [];
            categoriesFilter.forEach(id => categoryIDs.push(parseInt(id)));
            this._categoriesSearchService.getCategories(categoryIDs).subscribe(response => {
                this.categories = response?.items ? response.items : [];
            },
            error => {
                    console.error("Error loading categories ", error);
            })
        }
    }
    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<{field: string, value: any}>();

    private _categoriesTooltipPipe: CategoryTooltipPipe;
    private _searchCategoriesSubscription : ISubscription;
    public _categoriesTooltipResolver = (value: any) => {
        return this._categoriesTooltipPipe.transform(value);
    };
    public _categoriesProvider = new Subject<SuggestionsProviderData>();

    constructor(private _appLocalization: AppLocalization,
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
        const value = {};
        this.categories.forEach(category => cats.push(category.id));
        value[this._published] = cats.toString();
        this.onFilterChange.emit({field: 'categories', value});
    }

    public delete(): void {
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
    }
}
