import { Component, OnInit, OnDestroy, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs';

import {
    ESearchSearchUserAction,
    KalturaClient,
    KalturaESearchItemType,
    KalturaESearchOperatorType,
    KalturaESearchUserFieldName,
    KalturaESearchUserItem,
    KalturaESearchUserOperator,
    KalturaESearchUserParams, KalturaESearchUserResult
} from 'kaltura-ngx-client';
import { KalturaFilterPager } from 'kaltura-ngx-client';
import { SuggestionsProviderData } from '@kaltura-ng/kaltura-primeng-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui';
import { KalturaUser } from 'kaltura-ngx-client';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

@Component({
	selector: 'kBulkChangeOwner',
	templateUrl: './bulk-change-owner.component.html',
	styleUrls: ['./bulk-change-owner.component.scss']
})
export class BulkChangeOwner implements OnInit, OnDestroy, AfterViewInit {

	@Input() parentPopupWidget: PopupWidgetComponent;
	@Output() ownerChanged = new EventEmitter<KalturaUser>();

	public _loading = false;
	public _sectionBlockerMessage: AreaBlockerMessage;

	public _usersProvider = new Subject<SuggestionsProviderData>();
	public _owner: KalturaUser[] = [];
  public _disableApplyButton = true;

	private _searchUsersSubscription: ISubscription;
	private _parentPopupStateChangeSubscribe: ISubscription;
	private _confirmClose: boolean = true;

	constructor(private _kalturaServerClient: KalturaClient, private _appLocalization: AppLocalization, private _browserService: BrowserService) {
        this._convertUserInputToValidValue = this._convertUserInputToValidValue.bind(this); // fix scope issues when binding to a property
    }

	ngOnInit() {

	}

	ngAfterViewInit() {
		if (this.parentPopupWidget) {
			this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
				.subscribe(event => {
					if (event.state === PopupWidgetStates.Open) {
						this._confirmClose = true;
					}
					if (event.state === PopupWidgetStates.BeforeClose) {
						if (event.context && event.context.allowClose) {
							if (this._owner && this._confirmClose) {
								event.context.allowClose = false;
								this._browserService.confirm(
									{
										header: this._appLocalization.get('applications.content.entryDetails.captions.cancelEdit'),
										message: this._appLocalization.get('applications.content.entryDetails.captions.discard'),
										accept: () => {
											this._confirmClose = false;
											this.parentPopupWidget.close();
										}
									}
								);
							}
						}
					}
				});
		}
	}

	ngOnDestroy() {
		this._parentPopupStateChangeSubscribe.unsubscribe();
	}

	public _searchUsers(event): void {
		this._usersProvider.next({suggestions: [], isLoading: true});

		if (this._searchUsersSubscription) {
			// abort previous request
			this._searchUsersSubscription.unsubscribe();
			this._searchUsersSubscription = null;
		}

		this._searchUsersSubscription = this._kalturaServerClient.request(
            new ESearchSearchUserAction({
                searchParams: new KalturaESearchUserParams({
                    searchOperator: new KalturaESearchUserOperator({
                        operator: KalturaESearchOperatorType.orOp,
                        searchItems: [
                            new KalturaESearchUserItem({
                                itemType: KalturaESearchItemType.startsWith,
                                fieldName: KalturaESearchUserFieldName.screenName,
                                searchTerm: event.query
                            }),
                            new KalturaESearchUserItem({
                                itemType: KalturaESearchItemType.startsWith,
                                fieldName: KalturaESearchUserFieldName.firstName,
                                searchTerm: event.query.split(" ")[0]
                            }),
                            new KalturaESearchUserItem({
                                itemType: KalturaESearchItemType.partial,
                                fieldName: KalturaESearchUserFieldName.lastName,
                                searchTerm: event.query
                            }),
                            new KalturaESearchUserItem({
                                itemType: KalturaESearchItemType.startsWith,
                                fieldName: KalturaESearchUserFieldName.userId,
                                searchTerm: event.query
                            }),
							new KalturaESearchUserItem({
								itemType: KalturaESearchItemType.partial,
								fieldName: KalturaESearchUserFieldName.screenName,
								searchTerm: event.query
							}),
							new KalturaESearchUserItem({
								itemType: KalturaESearchItemType.partial,
								fieldName: KalturaESearchUserFieldName.userId,
								searchTerm: event.query
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
				data => {
					const suggestions = [];
                    let users = [];
                    if (data?.objects) {
                        data.objects.forEach((res: KalturaESearchUserResult) => users.push(res.object))
                    }
					users.forEach((suggestedUser: KalturaUser) => {
                        suggestedUser['__tooltip'] = suggestedUser.id;
						suggestions.push({
                            name: `${suggestedUser.screenName} (${suggestedUser.id})`,
							item: suggestedUser,
							isSelectable: true
						});
					});
					this._usersProvider.next({suggestions: suggestions, isLoading: false});
				},
				err => {
					this._usersProvider.next({
						suggestions: [],
						isLoading: false,
						errorMessage: <any>(err.message || err)
					});
				}
			);
	}

	public _convertUserInputToValidValue(value: string): any {
		let result = null;
		let tt = this._appLocalization.get('applications.content.entryDetails.users.tooltip', [value]);

		if (value) {
			result =
				{
					id: value,
					screenName: value,
					__tooltip: tt,
					__class: 'userAdded'
				}
		}
		return result;
	}

  public _apply() {
    const [owner] = this._owner;
    const hasScreenName = owner && (owner.screenName || '').trim() !== '';
    if (hasScreenName) {
      this.ownerChanged.emit(owner);
      this._confirmClose = false;
      this.parentPopupWidget.close();
    } else {
      this._browserService.alert({
        message: this._appLocalization.get('applications.content.entryDetails.users.noScreenName')
      });
    }
  }

  public _updateApplyButtonState(): void {
    const [owner] = this._owner;
    this._disableApplyButton = !owner || (owner.screenName || '').trim() === '';
  }
}

