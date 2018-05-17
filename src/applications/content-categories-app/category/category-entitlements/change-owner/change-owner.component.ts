import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ISubscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';

import {KalturaClient} from 'kaltura-ngx-client';
import {KalturaFilterPager} from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import {SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {BrowserService} from 'app-shared/kmc-shell';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {PopupWidgetComponent, PopupWidgetStates} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {KalturaUser} from 'kaltura-ngx-client/api/types/KalturaUser';
import {KalturaUserFilter} from 'kaltura-ngx-client/api/types/KalturaUserFilter';
import {UserListAction} from 'kaltura-ngx-client/api/types/UserListAction';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {CategoriesBulkChangeOwnerService} from '../../../categories/bulk-actions/services/categories-bulk-change-owner.service';

@Component({
  selector: 'kCategoryChangeOwner',
  templateUrl: './change-owner.component.html',
  styleUrls: ['./change-owner.component.scss']
})
export class CategoryChangeOwnerComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() category: KalturaCategory;
  @Output() ownerChanged = new EventEmitter<KalturaUser>();

  public _blockerMessage: AreaBlockerMessage;

  public _usersProvider = new Subject<SuggestionsProviderData>();
  public _owner: KalturaUser = null;

  private _searchUsersSubscription: ISubscription;
  private _parentPopupStateChangesSubscription: ISubscription;
  private _confirmClose = true;

  constructor(private _kalturaServerClient: KalturaClient, private _appLocalization: AppLocalization, private _browserService: BrowserService,
              private categoriesBulkChangeOwnerService: CategoriesBulkChangeOwnerService) {
      this._convertUserInputToValidValue = this._convertUserInputToValidValue.bind(this); // fix scope issues when binding to a property
  }

  ngOnInit() {
    if (!this.category) {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.categoryDetails.entitlements.owner.errors.unableToChange'),
        buttons: [{
          label: this._appLocalization.get('app.common.close'),
          action: () => {
            this._blockerMessage = null;
            if (this.parentPopupWidget) {
              this.parentPopupWidget.close();
            }
          }
        }
        ]
      });
    }

  }

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this._parentPopupStateChangesSubscription = this.parentPopupWidget.state$
        .subscribe(event => {
          if (event.state === PopupWidgetStates.Open) {
            this._confirmClose = true;
          }
          if (event.state === PopupWidgetStates.BeforeClose) {
            if (event.context && event.context.allowClose) {
              if (this._owner  && this._confirmClose) {
                event.context.allowClose = false;
                this._browserService.confirm(
                  {
                    header: this._appLocalization.get('applications.content.categoryDetails.entitlements.owner.cancelEdit'),
                    message: this._appLocalization.get('applications.content.categoryDetails.entitlements.owner.discard'),
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
    if (this._parentPopupStateChangesSubscription) {
      this._parentPopupStateChangesSubscription.unsubscribe();
    }
  }

  public _searchUsers(event): void {
    this._usersProvider.next({suggestions: [], isLoading: true});

    if (this._searchUsersSubscription) {
      // abort previous request
      this._searchUsersSubscription.unsubscribe();
      this._searchUsersSubscription = null;
    }

    this._searchUsersSubscription = this._kalturaServerClient.request(
      new UserListAction(
        {
          filter: new KalturaUserFilter({
            idOrScreenNameStartsWith: event.query
          }),
          pager: new KalturaFilterPager({
            pageIndex: 0,
            pageSize: 30
          })
        }
      )
    )
      .cancelOnDestroy(this)
      .monitor('search owners')
      .subscribe(
        data => {
          const suggestions = [];
          (data.objects || []).forEach((suggestedUser: KalturaUser) => {
            suggestions.push({
              name: suggestedUser.screenName + '(' + suggestedUser.id + ')',
              item: suggestedUser,
              isSelectable: true
            });
          });
          this._usersProvider.next({suggestions: suggestions, isLoading: false});
        },
        err => {
          this._usersProvider.next({suggestions: [], isLoading: false, errorMessage: <any>(err.message || err)});
        }
      );
  }

  public _convertUserInputToValidValue(value: string): KalturaUser {
    let result = null;
    const tt: string = this._appLocalization.get('applications.content.categoryDetails.entitlements.owner.tooltip', {0: value});

    if (value) {
      result = new KalturaUser(
        {
          id: value,
          screenName:  value,
        }
      );

      // override information needed by the ui only
      Object.assign(result, {
          __tooltip: tt,
          __class: 'userAdded'
      });
    }
    return result;
  }

  public _apply() {
    const owner: KalturaUser = Array.isArray(this._owner) ? this._owner[0] : this._owner;
    if (owner.id && this._isOwnerValid(owner.id)) {
      this._confirmClose = false;
      this.ownerChanged.emit(owner);
      if (this.parentPopupWidget) {
        this.parentPopupWidget.close();
      }
    } else {
      const message = owner.id ?
        this._appLocalization.get('applications.content.categoryDetails.entitlements.owner.errors.invalidOwner', {'0': owner.id}) :
        this._appLocalization.get('applications.content.categoryDetails.entitlements.owner.errors.ownerRequired');
      this._blockerMessage = new AreaBlockerMessage({
        message,
        buttons: [{
          label: this._appLocalization.get('app.common.close'),
          action: () => {
            this._blockerMessage = null;
          }
        }
        ]
      });
    }
  }

  private _isOwnerValid(userId: string) {
    const ownerRegex = /^[A-Za-z0-9,!#\$%&\'\*\+\?\^_`\{\|}~.@-]{1,320}$/;
    return ownerRegex.test(userId);
  }
}

