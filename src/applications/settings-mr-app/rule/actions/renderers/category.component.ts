import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {Action} from '../actions.component';
import {
    FlavorParamsListAction,
    KalturaClient,
    KalturaDetachedResponseProfile,
    KalturaFilterPager,
    KalturaResponseProfileType
} from 'kaltura-ngx-client';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {CategoriesSearchService, CategoryData} from 'app-shared/content-shared/categories/categories-search.service';
import {CategoryTooltipPipe} from 'app-shared/content-shared/categories/category-tooltip.pipe';
import {ISubscription} from 'rxjs/Subscription';
import {Observable, Subject} from 'rxjs';
import {SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui';

@Component({
    selector: 'kActionCategory',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="action">
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.actions.value' | translate}}</span>
                <span class="kText">{{this.type === 'addCategory' ? ('applications.settings.mr.actions.addCategory' | translate) : ('applications.settings.mr.actions.removeCategory' | translate)}}</span>
            </div>
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.actions.category' | translate}}</span>
                <div class="kCol">
                    <kAutoComplete [(ngModel)]="categories"
                                   (ngModelChange)="validate()"
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
                    <span class="kError" *ngIf="hasError">{{'applications.settings.mr.actions.categoriesError' | translate}}</span>
                    <a (click)="categoriesPopup.open()" class="kLink">
                        {{'applications.content.entryDetails.metadata.browse' | translate}}
                    </a>
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
export class ActionCategoryComponent implements OnDestroy{
    @Input() type: 'removeCategory' | 'addCategory';
    @Input() action: Action;
    @Input() profileId: string;
    @Output() onActionChange = new EventEmitter<Action>();

    public hasError = false;

    public categories: CategoryData[] = [];
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

    _updateCategories($event : any) : void {
        if ($event && $event instanceof Array)
        {
            this.categories = $event;
            this.validate();
        }
    }

    public validate(): void {
        this.hasError = this.categories.length === 0;
        if (!this.hasError) {
            const updateCategory = () => {
                if (this.type === 'addCategory') {
                    this.action.task .taskParams.modifyEntryTaskParams['addToCategoryIds'] = this.categories.map(category => category.id).toString();
                } else {
                    this.action.task .taskParams.modifyEntryTaskParams['removeFromCategoryIds'] = this.categories.map(category => category.id).toString();
                }
            }
            if (this.action.requires === 'add') {
                // new action - create task
                this.action.task = {
                    managedTasksProfileId: this.profileId,
                    type: 'modifyEntry',
                    taskParams: {
                        modifyEntryTaskParams: {}
                    }
                }
                updateCategory();
            } else {
                updateCategory(); // existing task
            }
            this.onActionChange.emit(this.action);
        }
    }

    public delete(): void {
        this.action.requires = 'delete';
        this.onActionChange.emit(this.action);
    }

    ngOnDestroy(): void {
        this._categoriesProvider.complete();
    }
}
