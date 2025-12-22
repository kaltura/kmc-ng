import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui';
import {ISubscription} from 'rxjs/Subscription';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {
    ESearchSearchUserAction,
    KalturaClient,
    KalturaESearchItemType,
    KalturaESearchOperatorType, KalturaESearchUserFieldName,
    KalturaESearchUserItem,
    KalturaESearchUserOperator,
    KalturaESearchUserParams, KalturaESearchUserResponse, KalturaESearchUserResult,
    KalturaFilterPager, KalturaMediaEntryFilter,
    KalturaUser, KalturaUserFilter, UserListAction
} from 'kaltura-ngx-client';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {AppAnalytics, ButtonType} from 'app-shared/kmc-shell';

@Component({
    selector: 'kCriteriaOwner',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="criteria">
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.criteria.header' | translate}}</span>
                <span class="kLabelWithHelpTip">{{'applications.settings.mr.criteria.owner' | translate}}</span>
                <kInputHelper>
                    <span>{{'applications.settings.mr.criteria.owner_tt' | translate}}</span>
                </kInputHelper>
            </div>

            <div class="kRow kCenter">
                <span class="kLabel">{{'applications.settings.mr.criteria.ownerLabel' | translate}}</span>
                <div class="kRow">
                    <p-dropdown [options]="_ownerOptions" [style]="{'width':'150px', 'margin-right': '16px'}" [(ngModel)]="_owner" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                    <div class="kCol">
                        <kAutoComplete
                            [(ngModel)]="owners"
                            (ngModelChange)="onCriteriaChange()"
                            suggestionItemField="item"
                            suggestionLabelField="name"
                            [tooltipResolver]="'__tooltip'"
                            [classField]="'__class'"
                            field="id"
                            [allowMultiple]="true"
                            [limitToSuggestions]="false"
                            [minLength]="3"
                            suggestionSelectableField="isSelectable"
                            [suggestionsProvider]="_usersProvider"
                            (completeMethod)="_searchUsers($event, 'editors')">
                        </kAutoComplete>
                    </div>
                </div>

            </div>

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>
    `
})
export class CriteriaOwnerComponent implements OnDestroy{

    public owners: KalturaUser[] = [];
    public _ownerOptions: { value: string, label: string }[] = [
        {value: 'userIdIn', label: this._appLocalization.get('applications.settings.mr.criteria.ownerIs')},
        {value: 'userIdNotIn', label: this._appLocalization.get('applications.settings.mr.criteria.ownerIsNot')}
    ];
    public _owner = 'userIdIn';

    private _filter: KalturaMediaEntryFilter;

    @Input() set filter(value: KalturaMediaEntryFilter) {
        if (value && (value['userIdIn'] || value['userIdNotIn'])) {
            this._owner = value['userIdIn'] ? 'userIdIn' : 'userIdNotIn'; // set dropdown value
            // load users from their IDs
            this._kalturaServerClient.request(new UserListAction({
                filter: new KalturaUserFilter({
                    idIn: value['userIdIn'] ? value['userIdIn'] : value['userIdNotIn']
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
        this._filter = value;
    }
    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<KalturaMediaEntryFilter>();

    private _searchUsersSubscription: ISubscription;
    public _usersProvider = new Subject<SuggestionsProviderData>();

    constructor(private _kalturaServerClient: KalturaClient,
                private _analytics: AppAnalytics,
                private _appLocalization: AppLocalization) {
    }


    public onCriteriaChange(): void {
        delete this._filter['userIdIn'];
        delete this._filter['userIdNotIn'];
        const userIds = [];
        this.owners.forEach(user => userIds.push(user.id));
        this._filter[this._owner] = userIds.toString();
        this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_owner_type', this._owner === 'userIdIn' ? 'is' : 'isn’t' , 'Automation_manager');
        this.onFilterChange.emit(this._filter);
    }

    public delete(): void {
        delete this._filter['userIdIn'];
        delete this._filter['userIdNotIn'];
        this.onFilterChange.emit(this._filter);
        this.onDelete.emit('owner');
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

    ngOnDestroy() {
        this._usersProvider.complete();
        if (this._searchUsersSubscription) {
            this._searchUsersSubscription.unsubscribe();
        }
    }
}
