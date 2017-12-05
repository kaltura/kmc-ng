import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ISubscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';

import {KalturaClient} from '@kaltura-ng/kaltura-client';
import {KalturaFilterPager} from 'kaltura-typescript-client/types/KalturaFilterPager';
import {SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {BrowserService} from 'app-shared/kmc-shell';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {PopupWidgetComponent, PopupWidgetStates} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {KalturaUser} from 'kaltura-typescript-client/types/KalturaUser';
import {KalturaUserFilter} from 'kaltura-typescript-client/types/KalturaUserFilter';
import {UserListAction} from 'kaltura-typescript-client/types/UserListAction';

@Component({
  selector: 'kAddUsers',
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.scss']
})
export class AddUsersComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() usersChanged = new EventEmitter<KalturaUser>();

  public _loading = false;
  public _blockerMessage: AreaBlockerMessage;

  public _usersProvider = new Subject<SuggestionsProviderData>();
  public _users: KalturaUser = null;

  private _searchUsersSubscription: ISubscription;
  private _parentPopupStateChangesSubscription: ISubscription;
  private _confirmClose = true;

  constructor(private _kalturaServerClient: KalturaClient, private _appLocalization: AppLocalization, private _browserService: BrowserService) {
  }

  ngOnInit() {
    // if (!this.category) {
    //   this._blockerMessage = new AreaBlockerMessage({
    //     message: this._appLocalization.get('applications.content.categoryDetails.entitlements.owner.errors.unableToChange'),
    //     buttons: [{
    //       label: this._appLocalization.get('app.common.close'),
    //       action: () => {
    //         this._blockerMessage = null;
    //         if (this.parentPopupWidget) {
    //           this.parentPopupWidget.close();
    //         }
    //       }
    //     }
    //     ]
    //   });
    // }

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
              if (this._users && this._confirmClose) {
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

    if (value) {
      result = new KalturaUser(
        {
          id: value,
          screenName: value
        }
      );
    }
    return result;
  }

  public _apply() {
    this._blockerMessage = null;
    this._loading = true;
    if (this._users) {
      // this.categoriesBulkChangeOwnerService.execute(this._users)
      //   .subscribe(result => {
      //     this._confirmClose = false;
      //     this.usersChanged.emit(Array.isArray(this._users) ? this._users[0] : this._users);
      //     this.parentPopupWidget.close();
      //   }, error => {
      //     this._blockerMessage = new AreaBlockerMessage({
      //       message: this._appLocalization.get('applications.content.categoryDetails.entitlements.owner.errors.changeOwnerFailed'),
      //       buttons: [{
      //         label: this._appLocalization.get('app.common.retry'),
      //         action: () => {
      //           this._apply();
      //         }
      //       }
      //       ]
      //     });
      //   });
    } else {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.categoryDetails.entitlements.owner.errors.selectUser'),
        buttons: [{
          label: this._appLocalization.get('app.common.ok'),
          action: () => {
            this._blockerMessage = null;
          }
        }
        ]
      });
    }
  }
}

