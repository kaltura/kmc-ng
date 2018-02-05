import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SettingsMyUserSettingsService } from './settings-my-user-settings.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaUser } from 'kaltura-ngx-client/api/types/KalturaUser';
import { KalturaUserRole } from 'kaltura-ngx-client/api/types/KalturaUserRole';
import { UserUpdateLoginDataActionArgs } from 'kaltura-ngx-client/api/types/UserUpdateLoginDataAction';

export type UserSettingsPopup = 'editUserNamePopup' | 'editEmailAddressPopup' | 'changePasswordPopup'

@Component({
  selector: 'kmc-settings-my-user-settings',
  templateUrl: './settings-my-user-settings.component.html',
  styleUrls: ['./settings-my-user-settings.component.scss'],
  providers: [SettingsMyUserSettingsService]
})
export class SettingsMyUserSettingsComponent implements OnInit, OnDestroy {
  @ViewChild('editUserNamePopup') public editUserNamePopup: PopupWidgetComponent;
  @ViewChild('editEmailAddressPopup') public editEmailAddressPopup: PopupWidgetComponent;
  @ViewChild('changePasswordPopup') public changePasswordPopup: PopupWidgetComponent;

  private _updateUserName = false;

  public _areaBlockerMessage: AreaBlockerMessage = null;
  public _updateBlockerMessage: AreaBlockerMessage = null;
  public _user: KalturaUser = null;
  public _role: KalturaUserRole = null;
  public _isBusy = false;

  constructor(private _myUserSettingsStore: SettingsMyUserSettingsService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._getUserData();
  }

  ngOnDestroy() {
  }

  private _isAllowedPopup(popupName: UserSettingsPopup): boolean {
    const allowedPopups = ['editUserNamePopup', 'editEmailAddressPopup', 'changePasswordPopup'];
    const isAllowed = allowedPopups.indexOf(popupName) !== -1;

    return isAllowed;
  }

  private _getUserData(): void {
    this._isBusy = true;
    this._areaBlockerMessage = null;
    this._myUserSettingsStore
      .getUserData()
      .cancelOnDestroy(this)
      .subscribe(
        ({ user, role }) => {
          this._isBusy = false;
          this._areaBlockerMessage = null;
          this._user = user;
          this._role = role;

          if (this._updateUserName) {
            this._updateUserName = false;
            this._myUserSettingsStore.updateUserNameManually(user);
          }
        },
        error => {
          this._areaBlockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [{
              label: this._appLocalization.get('app.common.retry'),
              action: () => {
                this._isBusy = false;
                this._areaBlockerMessage = null;
                this._getUserData();
              }
            }]
          });
        });
  }

  public _updateLoginData(userData: UserUpdateLoginDataActionArgs, popup: UserSettingsPopup): void {
    if (!this._isAllowedPopup(popup)) {
      throw Error(`Popup name "${popup}" is not allowed, the name have to be 'UserSettingsPopup' type`)
    }

    this._updateBlockerMessage = null;
    this._myUserSettingsStore
      .updateLoginData(userData)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this._updateBlockerMessage = null;
          this._updateUserName = true;
          this[popup].close();
          this._getUserData();
        },
        error => {
          const buttons = [{
            label: this._appLocalization.get('app.common.cancel'),
            action: () => this._updateBlockerMessage = null
          }];
          if (error.message === this._appLocalization.get('applications.settings.myUserSettings.errors.connection')) {
            buttons.push({
              label: this._appLocalization.get('app.common.retry'),
              action: () => this._updateLoginData(userData, popup)
            })
          }

          this._updateBlockerMessage = new AreaBlockerMessage({ message: error.message, buttons });
        }
      );
  }

  public _editUserName(): void {
    this._updateBlockerMessage = null;
    this.editUserNamePopup.open();
  }

  public _editEmailAddress(): void {
    this._updateBlockerMessage = null;
    this.editEmailAddressPopup.open();
  }

  public _changePassword(): void {
    this._updateBlockerMessage = null;
    this.changePasswordPopup.open();
  }
}
