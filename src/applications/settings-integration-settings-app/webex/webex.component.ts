import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    KalturaNullableBoolean, KalturaWebexAPIIntegrationSetting, KalturaWebexAPIIntegrationSettingResponse
} from 'kaltura-ngx-client';
import { WebexService } from './webex.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from "app-shared/kmc-shell";
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { SettingsIntegrationSettingsMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kWebexIntegration',
  templateUrl: './webex.component.html',
  styleUrls: ['./webex.component.scss'],
  providers: [
    WebexService,
    KalturaLogger.createLogger('WebexIntegrationComponent')
  ]
})

export class WebexComponent implements OnInit, OnDestroy {

  public _currentProfile: KalturaWebexAPIIntegrationSetting = null;
  public _profiles: KalturaWebexAPIIntegrationSetting[];
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;
  public _kmcPermissions = KMCPermissions;
  public maxAccountsAllowed = 6;
  public totalCount = 0;

  @ViewChild('editProfile', { static: true }) editProfile: PopupWidgetComponent;

  constructor(private _webexService: WebexService,
              private _appLocalization: AppLocalization,
              private _logger: KalturaLogger,
              private _settingsIntegrationSettingsMainView: SettingsIntegrationSettingsMainViewService,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
      if (this._settingsIntegrationSettingsMainView.isAvailable()) {
          this._loadWebexIntegrationProfiles();
      }
  }

  ngOnDestroy() {
  }

  public saveProfile(profile: KalturaWebexAPIIntegrationSetting): void {
      this.updateProfile(profile);
  }

  public _onActionSelected({action, profile}: { action: string, profile: KalturaWebexAPIIntegrationSetting }) {
    switch (action) {
      case 'edit':
        this._logger.info(`handle edit profile action by user`, { userId: profile.defaultUserId, accountId: profile.accountId });
        this._currentProfile = profile;
        this.editProfile.open();
        break;
      case 'enable':
        this._logger.info(`handle enable profile action by user`, { userId: profile.defaultUserId, accountId: profile.accountId });
        profile.enableRecordingUpload = KalturaNullableBoolean.trueValue;
        this.updateProfile(profile);
        break;
      case 'disable':
        this._logger.info(`handle disable profile action by user`, { userId: profile.defaultUserId, accountId: profile.accountId });
          profile.enableRecordingUpload = KalturaNullableBoolean.falseValue;
        this.updateProfile(profile);
        break;
      default:
        break;
    }
  }

  private _loadWebexIntegrationProfiles() {
    this._logger.info(`handle loading integration profiles`);
    this._updateAreaBlockerState(true, null);
    this._webexService.loadWebexIntegrationProfiles()
      .pipe(cancelOnDestroy(this))
      .subscribe(
        (response: KalturaWebexAPIIntegrationSettingResponse) => {
          this._logger.info(`handle successful loading webex integration profiles`);
          this._updateAreaBlockerState(false, null);
          this._profiles = response.objects ? response.objects.sort((a,b) => (a.updatedAt > b.updatedAt) ? -1 : ((b.updatedAt > a.updatedAt) ? 1 : 0)) : [];
          this.totalCount = this._profiles.length;
          if (this.totalCount > this.maxAccountsAllowed) {
              this._profiles.splice(this.maxAccountsAllowed, this.totalCount -this.maxAccountsAllowed);
          }
        },
        error => {
          this._logger.warn(`handle failed loading webex integration profiles, show alert`, { errorMessage: error.message });
          const blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.settings.integrationSettings.zoom.loadError'),
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._logger.info(`user selected retry, retry action`);
                  this._loadWebexIntegrationProfiles();
                }
              }
            ]
          });
          this._updateAreaBlockerState(false, blockerMessage);
        }
      );
  }

  private updateProfile(profile: KalturaWebexAPIIntegrationSetting): void {
      this._logger.info(`handle update integration profile`);
      this._updateAreaBlockerState(true, null);
      this._webexService.updateProfile(profile)
          .pipe(cancelOnDestroy(this))
          .subscribe(
              (response: string) => {
                  this._logger.info(`handle successful update zoom integration profiles`);
                  this._loadWebexIntegrationProfiles();
              },
              error => {
                  this._logger.warn(`handle failed updating webex integration profile, show alert`, { errorMessage: error.message });
                  const blockerMessage = new AreaBlockerMessage({
                      message: this._appLocalization.get('applications.settings.integrationSettings.webex.updateError'),
                      buttons: [
                          {
                              label: this._appLocalization.get('app.common.retry'),
                              action: () => {
                                  this._logger.info(`user selected retry, retry action`);
                                  this.updateProfile(profile);
                              }
                          }
                      ]
                  });
                  this._updateAreaBlockerState(false, blockerMessage);
              }
          );
  }

  private _updateAreaBlockerState(isBusy: boolean, areaBlocker: AreaBlockerMessage): void {
    this._logger.debug(`update areablocker state`, { isBusy, message: areaBlocker ? areaBlocker.message : null });
    this._isBusy = isBusy;
    this._blockerMessage = areaBlocker;
  }

}
