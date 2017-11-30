import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SettingsMyUserSettingsService } from './settings-my-user-settings.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaUser } from 'kaltura-typescript-client/types/KalturaUser';
import { KalturaUserRole } from 'kaltura-typescript-client/types/KalturaUserRole';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

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

  private _areaBlockerMessage: AreaBlockerMessage = null;
  user: KalturaUser = null;
  role: KalturaUserRole = null;
  _isBusy = false;

  constructor(
    public _myUserSettingsStore: SettingsMyUserSettingsService,
    private _appLocalization: AppLocalization
  ) {}

  private _getUserData(): void {
    this._isBusy = true;
    this._myUserSettingsStore.getUserData()
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this._isBusy = false;
          this.user = response.user;
          this._getRoleDescription(this.user.roleIds);
        },
        error => {
          this._areaBlockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._isBusy = false;
                    this._areaBlockerMessage = null;
                    this._getUserData();
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._isBusy = false;
                    this._areaBlockerMessage = null;
                  }
                }
              ]
            }
          )
        }
      );
  }

  private _getRoleDescription(roleIds: string): void {
    this._isBusy = true;
    this._myUserSettingsStore.getRoleDescription(roleIds)
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this._isBusy = false;
          this.role = response.role;
        },
        error => {
          this._areaBlockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._isBusy = false;
                    this._areaBlockerMessage = null;
                    this._getUserData();
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._isBusy = false;
                    this._areaBlockerMessage = null;
                  }
                }
              ]
            }
          )
        }
      );
  }

  private _editUserName(): void {
    this.editUserNamePopup.open();
  }

  private _editEmailAddress(): void {
    this.editEmailAddressPopup.open();
  }

  private _changePassword(): void {
    this.changePasswordPopup.open();
  }

  ngOnInit() {
    this._getUserData();
  }

  ngOnDestroy() {}
}
