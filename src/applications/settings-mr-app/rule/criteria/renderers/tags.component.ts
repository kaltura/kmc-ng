import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui';
import {ISubscription} from 'rxjs/Subscription';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {
    KalturaClient,
    KalturaFilterPager,
    KalturaMediaEntryFilter,
    KalturaMediaEntryMatchAttribute,
    KalturaSearchOperator,
    KalturaSearchOperatorType,
    KalturaTagFilter,
    KalturaTaggedObjectType,
    TagSearchAction,
    KalturaMediaEntryMatchAttributeCondition
} from 'kaltura-ngx-client';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {AppAnalytics} from 'app-shared/kmc-shell';
import {KalturaSearchItem} from 'kaltura-ngx-client/lib/api/types/KalturaSearchItem';

@Component({
    selector: 'kCriteriaTags',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="criteria">
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.criteria.header' | translate}}</span>
                <span class="kLabelWithHelpTip">{{'applications.settings.mr.criteria.tags' | translate}}</span>
                <kInputHelper>
                    <span>{{'applications.settings.mr.criteria.tags_tt' | translate}}</span>
                </kInputHelper>
            </div>

            <div class="kRow kCenter">
                <span class="kLabel">{{'applications.settings.mr.criteria.tagsLabel' | translate}}</span>
                <div class="kRow">
                    <p-dropdown [options]="_tagsOptions" [style]="{'width':'150px', 'margin-right': '16px'}" [(ngModel)]="_tags" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                    <div class="kCol">
                        <kAutoComplete [style]="{'width':'150px'}"
                            [(ngModel)]="tags"
                            (ngModelChange)="onCriteriaChange()"
                            suggestionItemField="item"
                            suggestionSelectableField="isSelectable"
                            [allowMultiple]="true"
                            [limitToSuggestions]="false"
                            [minLength]="3"
                            [suggestionsProvider]="_tagsProvider"
                            (completeMethod)="_searchTags($event)">
                        </kAutoComplete>
                    </div>
                </div>

            </div>

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>
    `
})
export class CriteriaTagsComponent implements OnDestroy{

    public tags: string[] = [];
    public _tagsOptions: { value: string, label: string }[] = [
        {value: 'tagsIn', label: this._appLocalization.get('applications.settings.mr.criteria.tagsIn')},
        {value: 'tagsNotIn', label: this._appLocalization.get('applications.settings.mr.criteria.tagsNotIn')}
    ];
    public _tags = 'tagsIn';

    private _filter: KalturaMediaEntryFilter;

    @Input() set filter(value: KalturaMediaEntryFilter) {
        // Collect all tags from potentially multiple tag objects
        const allTags = new Set<string>();
        let notValue = null; // Track the 'not' value from the first tag object

        const updateTagsFromObject = (tagObject: any) => {
            if (notValue === null) {
                notValue = tagObject['not'];
                this._tags = tagObject['not'] === true ? 'tagsNotIn' : 'tagsIn';
            }
            // Handle both comma-separated values in a single object (backward compatibility)
            // and individual tag objects (new format)
            const tagValues = tagObject['value'].split(',');
            tagValues.forEach(tag => {
                if (tag.trim() !== '') {
                    allTags.add(tag.trim());
                }
            });
            // Convert Set to array for the tags property
            if (allTags.size > 0) {
                this.tags = Array.from(allTags);
            }
        }

        // backward compatible - collect tags from items array directly in advancedSearch top level
        if (value['advancedSearch'] && value['advancedSearch']['items'] && value['advancedSearch']['items'].length) {
            value['advancedSearch']['items'].forEach((advancedSearch: any) => {
                if (advancedSearch['attribute'] && advancedSearch['attribute'] === KalturaMediaEntryMatchAttribute.tags) {
                    updateTagsFromObject(advancedSearch);
                } else {
                    if (advancedSearch.items?.length) {
                        advancedSearch.items.forEach((item: any) => {
                            if (item['attribute'] && item['attribute'] === KalturaMediaEntryMatchAttribute.tags) {
                                updateTagsFromObject(item);
                            }
                        });
                    }
                }
            });

        }
        this._filter = value;
    }
    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<KalturaMediaEntryFilter>();

    private _searchTagsSubscription: ISubscription;
    public _tagsProvider = new Subject<SuggestionsProviderData>();

    constructor(private _kalturaServerClient: KalturaClient,
                private _analytics: AppAnalytics,
                private _appLocalization: AppLocalization) {
    }


    public onCriteriaChange(): void {
        // check if filter already have advacedSearch and add it if not
        if (!this._filter.advancedSearch) {
            this._filter.advancedSearch = {
                objectType: "KalturaSearchOperator",
                type: KalturaSearchOperatorType.searchAnd,
                items: []
            } as any;
        } else {
            this.deleteTagsFromFilter();
        }
        const advancedSearch = (this._filter.advancedSearch as any).items;

        const items: KalturaSearchItem[] = [];
        this.tags.forEach(tag => {
            items.push({
                objectType: "KalturaMediaEntryMatchAttributeCondition",
                not: this._tags === 'tagsIn' ? false : true,
                attribute: KalturaMediaEntryMatchAttribute.tags,
                value: tag
            } as any);
        })
        advancedSearch.push({
            objectType: "KalturaSearchOperator",
            type: KalturaSearchOperatorType.searchOr,
            items
        });
        this.onFilterChange.emit(this._filter);
    }

    private deleteTagsFromFilter(): void {
        if ((this._filter.advancedSearch as any)?.items) {
            (this._filter.advancedSearch as any).items = (this._filter.advancedSearch as any).items.filter((item: any) => {
                // Keep only items that are not related to tags
                if (item['attribute'] === KalturaMediaEntryMatchAttribute.tags) {
                    return false; // Remove this item
                }
                // If the item has its own items array, filter it as well
                if (item.items && item.items.length) {
                    item.items = item.items.filter((subItem: any) => subItem['attribute'] !== KalturaMediaEntryMatchAttribute.tags);
                }
                if (item.items?.length === 0) {
                    return false; // Remove the parent item if it has no sub-items left
                }
                return true; // Keep this item
            });
        }
    }

    public delete(): void {
        this.deleteTagsFromFilter();
        this.onFilterChange.emit(this._filter);
        this.onDelete.emit('tags');
    }

    private searchTags(text: string): Observable<string[]> {
        return Observable.create(
            observer => {
                const requestSubscription = this._kalturaServerClient.request(
                    new TagSearchAction(
                        {
                            tagFilter: new KalturaTagFilter(
                                {
                                    tagStartsWith: text,
                                    objectTypeEqual: KalturaTaggedObjectType.entry
                                }
                            ),
                            pager: new KalturaFilterPager({
                                pageIndex: 0,
                                pageSize: 30
                            })
                        }
                    )
                )
                    .pipe(cancelOnDestroy(this))
                    .subscribe(
                        result => {
                            const tags = result.objects.map(item => item.tag);
                            observer.next(tags);
                            observer.complete();
                        },
                        err => {
                            observer.error(err);
                        }
                    );

                return () => {
                    console.log('entryMetadataHandler.searchTags(): cancelled');
                    requestSubscription.unsubscribe();
                }
            });
    }

    public _searchTags(event): void {
        this._tagsProvider.next({ suggestions: [], isLoading: true });

        if (this._searchTagsSubscription) {
            // abort previous request
            this._searchTagsSubscription.unsubscribe();
            this._searchTagsSubscription = null;
        }

        this._searchTagsSubscription = this.searchTags(event.query).subscribe(data => {
                const suggestions = [];
                (data || []).forEach(suggestedTag => {
                    const isSelectable = !this.tags.find(tag => {
                        return tag === suggestedTag;
                    });
                    suggestions.push({ item: suggestedTag, isSelectable: isSelectable });
                });
                this._tagsProvider.next({ suggestions: suggestions, isLoading: false });
            },
            (err) => {
                this._tagsProvider.next({ suggestions: [], isLoading: false, errorMessage: <any>(err.message || err) });
            });
    }

    ngOnDestroy() {
        this._tagsProvider.complete();
        if (this._searchTagsSubscription) {
            this._searchTagsSubscription.unsubscribe();
        }
    }
}
