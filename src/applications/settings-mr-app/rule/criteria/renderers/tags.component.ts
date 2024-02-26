import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui';
import {ISubscription} from 'rxjs/Subscription';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {KalturaClient, KalturaFilterPager, KalturaTagFilter, KalturaTaggedObjectType, TagSearchAction} from 'kaltura-ngx-client';

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
                <div class="kCol">
                    <kAutoComplete
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

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>
    `
})
export class CriteriaTagsComponent implements OnDestroy{

    public tags: string[] = [];

    @Input() set filter(value: any) {
        if (value && value['tagsMultiLikeOr']) {
            this.tags = value['tagsMultiLikeOr'].split(',');
        }
    }
    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<{field: string, value: any}>();

    private _searchTagsSubscription: ISubscription;
    public _tagsProvider = new Subject<SuggestionsProviderData>();

    constructor(private _kalturaServerClient: KalturaClient,) {
    }


    public onCriteriaChange(): void {
        const value = {};
        value['tagsMultiLikeOr'] = this.tags.toString();
        this.onFilterChange.emit({field: 'tags', value});
    }

    public delete(): void {
        this.onDelete.emit('tags');
    }

    public searchTags(text: string): Observable<string[]> {
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
