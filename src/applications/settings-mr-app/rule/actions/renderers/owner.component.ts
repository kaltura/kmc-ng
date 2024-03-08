import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Action} from '../actions.component';
import {
    ESearchSearchUserAction,
    KalturaClient,
    KalturaESearchItemType,
    KalturaESearchOperatorType, KalturaESearchUserFieldName,
    KalturaESearchUserItem,
    KalturaESearchUserOperator,
    KalturaESearchUserParams, KalturaESearchUserResponse, KalturaESearchUserResult,
    KalturaFilterPager,
    KalturaUser, KalturaUserFilter, UserListAction
} from 'kaltura-ngx-client';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {ISubscription} from 'rxjs/Subscription';
import {Observable, Subject} from 'rxjs';
import {SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui';

@Component({
    selector: 'kActionOwner',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="action">
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.actions.value' | translate}}</span>
                <span class="kLabelWithHelpTip">{{'applications.settings.mr.actions.owner' | translate}}</span>
                <kInputHelper>
                    <span>{{'applications.settings.mr.actions.owner_tt' | translate}}</span>
                </kInputHelper>
            </div>
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.filter.owner' | translate}}</span>
                <div class="kCol">
                    <kAutoComplete
                        [(ngModel)]="owners"
                        (ngModelChange)="validate()"
                        suggestionItemField="item"
                        suggestionLabelField="name"
                        [tooltipResolver]="'__tooltip'"
                        [classField]="'__class'"
                        field="id"
                        [allowMultiple]="false"
                        [limitToSuggestions]="false"
                        [minLength]="3"
                        suggestionSelectableField="isSelectable"
                        [suggestionsProvider]="_usersProvider"
                        (completeMethod)="_searchUsers($event, 'editors')">
                    </kAutoComplete>
                    <span class="kError" *ngIf="hasError">{{'applications.settings.mr.actions.ownerError' | translate}}</span>
                </div>
            </div>

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>

    `
})
export class ActionOwnerComponent implements OnDestroy{
    @Input() set ruleAction(value: Action) {
        this.action = value;
        const userId = value.task?.taskParams?.modifyEntryTaskParams?.kalturaEntry?.userId;
        if (userId) {
            // load users from their IDs
            this._kalturaServerClient.request(new UserListAction({
                filter: new KalturaUserFilter({
                    idIn: userId
                })
            }))
                .pipe(cancelOnDestroy(this))
                .subscribe(response => {
                        this.owners = response?.objects ? response.objects : [];
                    },
                    error => {
                        console.error("Error loading users ", error);
                    })
        }
    };
    @Input() profileId: string;
    @Output() onActionChange = new EventEmitter<Action>();

    public hasError = false;
    public action: Action;

    public owners: KalturaUser[] = [];
    private _searchUsersSubscription: ISubscription;
    public _usersProvider = new Subject<SuggestionsProviderData>();

    constructor(private _kalturaServerClient: KalturaClient) {
    }

    private searchUsers(text : string) {
        return Observable.create(
            observer => {
                const requestSubscription: ISubscription = this._kalturaServerClient.request(
                    new ESearchSearchUserAction({
                        searchParams: new KalturaESearchUserParams({
                            searchOperator: new KalturaESearchUserOperator({
                                operator: KalturaESearchOperatorType.orOp,
                                searchItems: [
                                    new KalturaESearchUserItem({
                                        itemType: KalturaESearchItemType.startsWith,
                                        fieldName: KalturaESearchUserFieldName.screenName,
                                        searchTerm: text
                                    }),
                                    new KalturaESearchUserItem({
                                        itemType: KalturaESearchItemType.startsWith,
                                        fieldName: KalturaESearchUserFieldName.firstName,
                                        searchTerm: text.split(" ")[0]
                                    }),
                                    new KalturaESearchUserItem({
                                        itemType: KalturaESearchItemType.partial,
                                        fieldName: KalturaESearchUserFieldName.lastName,
                                        searchTerm: text
                                    }),
                                    new KalturaESearchUserItem({
                                        itemType: KalturaESearchItemType.startsWith,
                                        fieldName: KalturaESearchUserFieldName.userId,
                                        searchTerm: text
                                    })
                                ]
                            })
                        }),
                        pager: new KalturaFilterPager({
                            pageIndex : 0,
                            pageSize : 30
                        })
                    })
                )
                    .pipe(cancelOnDestroy(this))
                    .subscribe(
                        (result: KalturaESearchUserResponse) =>
                        {
                            let users = [];
                            if (result?.objects) {
                                result.objects.forEach((res: KalturaESearchUserResult) => users.push(res.object))
                            }
                            observer.next(users);
                            observer.complete();
                        },
                        err =>
                        {
                            observer.error(err);
                        }
                    );

                return () =>
                {
                    console.log("entryUsersHandler.searchOwners(): cancelled");
                    requestSubscription.unsubscribe();
                }
            });
    }

    public _searchUsers(event, formControl?) : void {
        this._usersProvider.next({ suggestions : [], isLoading : true});

        if (this._searchUsersSubscription)
        {
            // abort previous request
            this._searchUsersSubscription.unsubscribe();
            this._searchUsersSubscription = null;
        }

        this._searchUsersSubscription = this.searchUsers(event.query).subscribe(data => {
                const suggestions = [];
                (data || []).forEach((suggestedUser: KalturaUser) => {
                    suggestedUser['__tooltip'] = suggestedUser.id;
                    let isSelectable = true;
                    if (formControl){
                        isSelectable = !this.owners.find(user => {
                            return user.id === suggestedUser.id;
                        });
                    }
                    suggestions.push({
                        name: `${suggestedUser.screenName} (${suggestedUser.id})`,
                        item: suggestedUser,
                        isSelectable: isSelectable
                    });
                });
                this._usersProvider.next({suggestions: suggestions, isLoading: false});
            },
            (err) => {
                this._usersProvider.next({ suggestions : [], isLoading : false, errorMessage : <any>(err.message || err)});
            });
    }

    public validate(): void {
        this.hasError = this.owners.length === 0;
        if (!this.hasError) {
            const updateOwner = () => {
                this.action.task.taskParams.modifyEntryTaskParams.kalturaEntry.userId = this.owners[0].id;
            }
            if (this.action.requires === 'create') {
                // new action - create task
                this.action.task = {
                    managedTasksProfileId: this.profileId,
                    type: 'modifyEntry',
                    taskParams: {
                        modifyEntryTaskParams: {
                            kalturaEntry: {}
                        }
                    }
                }
                updateOwner();
            } else {
                updateOwner(); // existing task
            }
            this.onActionChange.emit(this.action);
        }
    }

    public delete(): void {
        this.action.requires = 'delete';
        this.onActionChange.emit(this.action);
    }

    ngOnDestroy(): void {
        this._usersProvider.complete();
        if (this._searchUsersSubscription) {
            this._searchUsersSubscription.unsubscribe();
        }
    }
}
