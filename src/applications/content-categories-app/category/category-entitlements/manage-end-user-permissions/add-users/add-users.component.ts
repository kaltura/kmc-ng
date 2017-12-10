import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ISubscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';
import {SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {KalturaUser} from 'kaltura-ngx-client/api/types/KalturaUser';
import {KalturaInheritanceType} from 'kaltura-ngx-client/api/types/KalturaInheritanceType';
import {KalturaCategoryUserPermissionLevel} from 'kaltura-ngx-client/api/types/KalturaCategoryUserPermissionLevel';
import {KalturaUpdateMethodType} from 'kaltura-ngx-client/api/types/KalturaUpdateMethodType';
import {AddUsersService} from './add-users.service';


@Component({
  selector: 'kAddUsers',
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.scss'],
  providers: [AddUsersService]
})
export class AddUsersComponent implements OnInit, OnDestroy {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() parentCategory: KalturaCategory;
  @Output() usersAdded = new EventEmitter<KalturaUser>();

  public _loading = false;
  public _blockerMessage: AreaBlockerMessage;

  public _usersProvider = new Subject<SuggestionsProviderData>();
  public _users: KalturaUser[] = null;
  public _selectedPermissionLevel = KalturaCategoryUserPermissionLevel.member;
  public _selectedUpdateMethod = KalturaUpdateMethodType.automatic;
  public _permissionLevelOptions: { value: number, label: string }[] = [];
  public _updateMethodOptions: { value: number, label: string }[] = [];
  public _kalturaInheritanceType = KalturaInheritanceType;

  public _selectedPermissionSettings: 'inherit' | 'setPermissions' = null;

  private _searchUsersSubscription: ISubscription;
  private _parentPopupStateChangesSubscription: ISubscription;

  constructor( private _appLocalization: AppLocalization,
              private _addUsersService: AddUsersService) {
  }

  ngOnInit() {
    if (!this.parentCategory) {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization
          .get('applications.content.categoryDetails.entitlements.usersPermissions.errors.loadEndUserPermissions'),
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

    if (this.parentCategory.id) {
      this._selectedPermissionSettings = this.parentCategory.membersCount > 0 ? 'setPermissions' : 'inherit';
    }

    this._fillPermissionLevelOptions();
    this._fillUpdateMethodOptions();
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

    this._searchUsersSubscription = this._addUsersService.getUsersSuggestions(event.query)
      .cancelOnDestroy(this)
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
    if (this._users) {
      this._addUsersService
        .addUsers(
          {
            usersIds: this._users.map(user => user.id),
            categoryId: this.parentCategory.id,
            permissionLevel: this._selectedPermissionLevel,
            updateMethod: this._selectedUpdateMethod
          })
        .tag('block-shell')
        .subscribe(
          result => {
            this.usersAdded.emit();
            if (this.parentPopupWidget) {
              this.parentPopupWidget.close();
            }
          },
          error => {
            this._blockerMessage = error;
          }
        );
    } else {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization
          .get('applications.content.categoryDetails.entitlements.usersPermissions.addUsers.errors.missingUsers'),
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

  private _fillPermissionLevelOptions() {
    this._permissionLevelOptions = [{
      value: KalturaCategoryUserPermissionLevel.member,
      label: this._appLocalization
        .get('applications.content.categoryDetails.entitlements.usersPermissions.addUsers.permissionsLevelOptions.member')
    }, {
      value: KalturaCategoryUserPermissionLevel.contributor,
      label: this._appLocalization
        .get('applications.content.categoryDetails.entitlements.usersPermissions.addUsers.permissionsLevelOptions.contributor')
    }, {
      value: KalturaCategoryUserPermissionLevel.moderator,
      label: this._appLocalization
        .get('applications.content.categoryDetails.entitlements.usersPermissions.addUsers.permissionsLevelOptions.moderator')
    }, {
      value: KalturaCategoryUserPermissionLevel.manager,
      label: this._appLocalization
        .get('applications.content.categoryDetails.entitlements.usersPermissions.addUsers.permissionsLevelOptions.manager')
    }];
  }

  private _fillUpdateMethodOptions() {
    this._updateMethodOptions = [{
      value: KalturaUpdateMethodType.automatic,
      label: this._appLocalization
        .get('applications.content.categoryDetails.entitlements.usersPermissions.addUsers.updateMethodOptions.automatic')
    }, {
      value: KalturaUpdateMethodType.manual,
      label: this._appLocalization
        .get('applications.content.categoryDetails.entitlements.usersPermissions.addUsers.updateMethodOptions.manual')
    }];
  }

  public _clearUsers() {
    this._users = null;
  }
}

