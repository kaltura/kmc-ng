import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {ISubscription} from 'rxjs/Subscription';
import {Observable, Subject} from 'rxjs';
import {SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui';
import {
    ESearchSearchUserAction, KalturaClient, KalturaESearchItemType,
    KalturaESearchOperatorType, KalturaESearchUserFieldName, KalturaESearchUserItem,
    KalturaESearchUserOperator,
    KalturaESearchUserParams, KalturaESearchUserResponse, KalturaESearchUserResult, KalturaFilterPager,
    KalturaUser
} from 'kaltura-ngx-client';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';


@Component({
    selector: 'kOwnersSelector',
    templateUrl: './owner-selector.component.html',
    styleUrls: ['./owner-selector.component.scss']
})
export class OwnerSelector implements OnInit, OnDestroy {
    @Input() parentPopupWidget: PopupWidgetComponent;
    @Output() ownerSelected = new EventEmitter<string>();

    private _searchUsersSubscription: ISubscription;
    public _usersProvider = new Subject<SuggestionsProviderData>();
    public owners: KalturaUser[] = [];

    constructor(private _kalturaServerClient: KalturaClient) {
    }


    ngOnInit() {

    }

    private searchUsers(text: string) {
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
                                        searchTerm: text.split(' ')[0]
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
                            pageIndex: 0,
                            pageSize: 30
                        })
                    })
                )
                    .pipe(cancelOnDestroy(this))
                    .subscribe(
                        (result: KalturaESearchUserResponse) => {
                            let users = [];
                            if (result?.objects) {
                                result.objects.forEach((res: KalturaESearchUserResult) => users.push(res.object));
                            }
                            observer.next(users);
                            observer.complete();
                        },
                        err => {
                            observer.error(err);
                        }
                    );

                return () => {
                    console.log('entryUsersHandler.searchOwners(): cancelled');
                    requestSubscription.unsubscribe();
                };
            });
    }

    public _searchUsers(event, formControl?): void {
        this._usersProvider.next({suggestions: [], isLoading: true});

        if (this._searchUsersSubscription) {
            // abort previous request
            this._searchUsersSubscription.unsubscribe();
            this._searchUsersSubscription = null;
        }

        this._searchUsersSubscription = this.searchUsers(event.query).subscribe(data => {
                const suggestions = [];
                (data || []).forEach((suggestedUser: KalturaUser) => {
                    suggestedUser['__tooltip'] = suggestedUser.id;
                    let isSelectable = true;
                    if (formControl) {
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
                this._usersProvider.next({suggestions: [], isLoading: false, errorMessage: <any>(err.message || err)});
            });
    }

    ngOnDestroy() {
        if (this._searchUsersSubscription) {
            this._searchUsersSubscription.unsubscribe();
            this._searchUsersSubscription = null;
        }
    }

    public _saveAndClose(): void {
        if (this.owners.length > 0) {
            const ownerId = this.owners[0].id;
            this.ownerSelected.emit(ownerId);
        }
        this.parentPopupWidget.close({isDirty: true});
    }

}
