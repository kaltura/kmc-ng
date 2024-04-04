import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {Action} from '../actions.component';
import {KalturaClient, KalturaFilterPager, KalturaTagFilter, KalturaTaggedObjectType, TagSearchAction} from 'kaltura-ngx-client';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {ISubscription} from 'rxjs/Subscription';
import {Observable, Subject} from 'rxjs';
import {SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui';

@Component({
    selector: 'kActionTags',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="action">
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.actions.value' | translate}}</span>
                <span class="kLabelWithHelpTip">{{this.type === 'addTags' ? ('applications.settings.mr.actions.addTags' | translate) : ('applications.settings.mr.actions.removeTags' | translate)}}</span>
                <kInputHelper>
                    <span>{{this.type === 'addTags' ? ('applications.settings.mr.actions.addTags_tt' | translate) : ('applications.settings.mr.actions.removeTags_tt' | translate)}}</span>
                </kInputHelper>
            </div>
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.actions.tag' | translate}}</span>
                <div class="kCol">
                    <kAutoComplete
                        [(ngModel)]="tags"
                        (ngModelChange)="validate()"
                        suggestionItemField="item"
                        suggestionSelectableField="isSelectable"
                        [allowMultiple]="true"
                        [limitToSuggestions]="false"
                        [minLength]="3"
                        [suggestionsProvider]="_tagsProvider"
                        (completeMethod)="_searchTags($event)">
                    </kAutoComplete>
                    <span class="kError" *ngIf="hasError">{{'applications.settings.mr.actions.tagsError' | translate}}</span>
                </div>
            </div>

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>
    `
})
export class ActionTagsComponent implements OnDestroy{
    @Input() type: 'removeTags' | 'addTags';
    @Input() set ruleAction(value: Action) {
        this.action = value;
        // use timeout to verify type is set already
        setTimeout(() => {
            let tagsIds = [];
            if (this.type === 'addTags') {
                tagsIds = this.action.task?.taskParams?.modifyEntryTaskParams?.addTags?.split(',') || [];
            } else {
                tagsIds = this.action.task?.taskParams?.modifyEntryTaskParams?.removeTags?.split(',') || [];
            }
            this.tags = tagsIds;
        }, 100)
    };
    @Input() profileId: string;
    @Output() onActionChange = new EventEmitter<Action>();

    public hasError = false;

    public action: Action;
    public tags: string[] = [];
    private _searchTagsSubscription: ISubscription;
    public _tagsProvider = new Subject<SuggestionsProviderData>();

    constructor(private _kalturaServerClient: KalturaClient) {
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

    public validate(): void {
        this.hasError = this.tags.length === 0;
        if (!this.hasError) {
            const updateTags = () => {
                if (this.type === 'addTags') {
                    this.action.task.taskParams.modifyEntryTaskParams['addTags'] = this.tags.toString();
                } else {
                    this.action.task.taskParams.modifyEntryTaskParams['removeTags'] = this.tags.toString();
                }
            }
            if (this.action.requires === 'create') {
                // new action - create task
                this.action.task = {
                    managedTasksProfileId: this.profileId,
                    type: 'modifyEntry',
                    status: 'enabled',
                    taskParams: {
                        modifyEntryTaskParams: {}
                    }
                }
                updateTags();
            } else {
                updateTags(); // existing task
            }
            this.onActionChange.emit(this.action);
        }
    }

    public delete(): void {
        this.action.requires = 'delete';
        this.onActionChange.emit(this.action);
    }

    ngOnDestroy(): void {
        this._tagsProvider.complete();
        if (this._searchTagsSubscription) {
            this._searchTagsSubscription.unsubscribe();
        }
    }
}
