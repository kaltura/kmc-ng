import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui';
import {ISubscription} from 'rxjs/Subscription';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {KalturaClient, KalturaFilterPager,  KalturaMediaEntryMatchAttribute, KalturaTagFilter, KalturaTaggedObjectType, TagSearchAction} from 'kaltura-ngx-client';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {AppAnalytics, ButtonType} from 'app-shared/kmc-shell';

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

    @Input() set filter(value: any) {
        if (value['advancedSearch'] && value['advancedSearch']['items'] && value['advancedSearch']['items'].length) {
            // Collect all tags from potentially multiple tag objects
            const allTags = new Set<string>();
            let notValue = null; // Track the 'not' value from the first tag object

            value['advancedSearch']['items'].forEach((advancedSearch: any) => {
                if (advancedSearch['attribute'] && advancedSearch['attribute'] === KalturaMediaEntryMatchAttribute.tags) {
                    if (notValue === null) {
                        notValue = advancedSearch['not'];
                        this._tags = advancedSearch['not'] === true ? 'tagsNotIn' : 'tagsIn';
                    }

                    // Handle both comma-separated values in a single object (backward compatibility)
                    // and individual tag objects (new format)
                    const tagValues = advancedSearch['value'].split(',');
                    tagValues.forEach(tag => {
                        if (tag.trim() !== '') {
                            allTags.add(tag.trim());
                        }
                    });
                }
            });

            // Convert Set to array for the tags property
            if (allTags.size > 0) {
                this.tags = Array.from(allTags);
            }
        }
    }
    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<{field: string, value: any}>();

    private _searchTagsSubscription: ISubscription;
    public _tagsProvider = new Subject<SuggestionsProviderData>();

    constructor(private _kalturaServerClient: KalturaClient,
                private _analytics: AppAnalytics,
                private _appLocalization: AppLocalization) {
    }


    public onCriteriaChange(): void {
        const value = {
            objectType: "KalturaMediaEntryMatchAttributeCondition",
            not: this._tags === 'tagsIn' ? false : true,
            attribute: KalturaMediaEntryMatchAttribute.tags,
            value: this.tags.toString()
        };
        this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_tags_type', this._tags === 'tagsIn' ? 'contains' : 'doesn’t_contain' , 'Automation_manager');
        this.onFilterChange.emit({field: 'tags', value});
    }

    public delete(): void {
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
