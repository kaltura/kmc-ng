import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SettingsMyUserSettingsService } from './settings-my-user-settings.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { KalturaUser } from 'kaltura-ngx-client';
import { KalturaUserRole } from 'kaltura-ngx-client';
import { UserUpdateLoginDataActionArgs } from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { SettingsMyUserSettingsMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { BrowserService } from 'shared/kmc-shell/providers/browser.service';
import {AppAuthentication} from "app-shared/kmc-shell";

export type UserSettingsPopup = 'editUserNamePopup' | 'editEmailAddressPopup' | 'changePasswordPopup'

@Component({
  selector: 'kmc-settings-my-user-settings',
  templateUrl: './settings-my-user-settings.component.html',
  styleUrls: ['./settings-my-user-settings.component.scss'],
  providers: [
    SettingsMyUserSettingsService,
    KalturaLogger.createLogger('SettingsMyUserSettingsComponent')
  ]
})
export class SettingsMyUserSettingsComponent implements OnInit, OnDestroy {
  @ViewChild('editUserNamePopup', { static: true }) public editUserNamePopup: PopupWidgetComponent;
  // @ViewChild('editEmailAddressPopup', { static: true }) public editEmailAddressPopup: PopupWidgetComponent;
  @ViewChild('changePasswordPopup', { static: true }) public changePasswordPopup: PopupWidgetComponent;

  private _updateUserName = false;

  public _areaBlockerMessage: AreaBlockerMessage = null;
  public _updateBlockerMessage: AreaBlockerMessage = null;
  public _user: KalturaUser = null;
  public _role: KalturaUserRole = null;
  public _isBusy = false;
  public _showAuthenticator = false;
  public _showPassword = true;

  constructor(private _myUserSettingsStore: SettingsMyUserSettingsService,
              private _logger: KalturaLogger,
              private _settingsMyUserSettingsMainView: SettingsMyUserSettingsMainViewService,
              private _browserService: BrowserService,
              private _appAuthentication: AppAuthentication,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    if (this._settingsMyUserSettingsMainView.viewEntered()) {
        this._logger.info(`initiate my user settings view`);
        this._getUserData();
    }
    this._showPassword = this._appAuthentication.appUser.partnerInfo.blockDirectLogin ? false : true;
  }

  ngOnDestroy() {
  }

  private _isAllowedPopup(popupName: UserSettingsPopup): boolean {
    const allowedPopups = ['editUserNamePopup', 'editEmailAddressPopup', 'changePasswordPopup'];
    const isAllowed = allowedPopups.indexOf(popupName) !== -1;

    return isAllowed;
  }

  private _getUserData(): void {
    this._logger.info(`handle loading user data`);
    this._isBusy = true;
    this._areaBlockerMessage = null;
    this._myUserSettingsStore
      .getUserData()
      .pipe(cancelOnDestroy(this))
      .subscribe(
        ({ user, role }) => {
          this._logger.info(
            `handle successful loading user data`,
            { userId: user.id, userName: user.screenName, roleId: role.id, roleName: role.name }
          );
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
          this._logger.warn(`handle failed loading user data, show retry alert`);
          this._areaBlockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [{
              label: this._appLocalization.get('app.common.retry'),
              action: () => {
                this._logger.info(`user selected retry, retry action`, { errorMessage: error.message });
                this._isBusy = false;
                this._areaBlockerMessage = null;
                this._getUserData();
              }
            }]
          });
        });
  }

  /*
  public _updateEmail(email: string, popup: UserSettingsPopup): void {
      this._logger.info(`handle update user email request by user`);
      if (!this._isAllowedPopup(popup)) {
          throw Error(`Popup name "${popup}" is not allowed, the name have to be 'UserSettingsPopup' type`);
      }

      this._updateBlockerMessage = null;
      this._myUserSettingsStore
          .updateEmail(new KalturaUser({ id: this._user.id, email }))
          .pipe(cancelOnDestroy(this))
          .pipe(tag('block-shell'))
          .subscribe(
              () => {
                  this._logger.info(`handle successful update action`);
                  this._updateBlockerMessage = null;
                  this[popup].close();
                  this._getUserData();
              },
              error => {
                  this._logger.warn(`handle failed update email action, show confirmation`);
                  const buttons = [{
                      label: this._appLocalization.get('app.common.cancel'),
                      action: () => {
                          this._logger.info(`user canceled, dismiss dialog`);
                          this._updateBlockerMessage = null;
                      }
                  }];
                  if (error.message === this._appLocalization.get('applications.settings.myUserSettings.errors.connection')) {
                      buttons.push({
                          label: this._appLocalization.get('app.common.retry'),
                          action: () => {
                              this._logger.info(`user selected retry, retry update email action`);
                              this._updateEmail(email, popup);
                          }
                      });
                  }

                  this._updateBlockerMessage = new AreaBlockerMessage({ message: error.message, buttons });
              }
          );
  }
  */

  public _updateLoginData(userData: UserUpdateLoginDataActionArgs, popup: UserSettingsPopup): void {
    this._logger.info(`handle update user data request by user`);
    if (!this._isAllowedPopup(popup)) {
      throw Error(`Popup name "${popup}" is not allowed, the name have to be 'UserSettingsPopup' type`);
    }

    this._updateBlockerMessage = null;
    this._myUserSettingsStore
      .updateLoginData(userData)
      .pipe(cancelOnDestroy(this))
      .pipe(tag('block-shell'))
      .subscribe(
        () => {
          this._logger.info(`handle successful update action`);
          this._updateBlockerMessage = null;
          this._updateUserName = true;
          this[popup].close();
          this._getUserData();
        },
        error => {
          this._logger.warn(`handle failed update action, show confirmation`);
          const buttons = [{
            label: this._appLocalization.get('app.common.cancel'),
            action: () => {
              this._logger.info(`user canceled, dismiss dialog`);
              this._updateBlockerMessage = null;
            }
          }];
          if (error.message === this._appLocalization.get('applications.settings.myUserSettings.errors.connection')) {
            buttons.push({
              label: this._appLocalization.get('app.common.retry'),
              action: () => {
                this._logger.info(`user selected retry, retry update action`);
                this._updateLoginData(userData, popup);
              }
            });
          }
          if (error.message === this._appLocalization.get('app.login.error.missingOtp')){
            this._showAuthenticator = true;
          }

          this._updateBlockerMessage = new AreaBlockerMessage({ message: error.message, buttons });
        }
      );
  }

  public _editUserName(): void {
    this._logger.info(`handle edit user name action by user`);
    this._updateBlockerMessage = null;
    this.editUserNamePopup.open();
  }

  /*
  public _editEmailAddress(): void {
    this._logger.info(`handle edit user email action by user`);
    this._updateBlockerMessage = null;
    this.editEmailAddressPopup.open();
  }*/

  public _changePassword(): void {
    this._logger.info(`handle edit user password action by user`);
    this._updateBlockerMessage = null;
    this.changePasswordPopup.open();
  }
}
