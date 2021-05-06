import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    KalturaZoomIntegrationSettingResponse,
    KalturaZoomIntegrationSetting,
    KalturaNullableBoolean
} from 'kaltura-ngx-client';
import { ZoomService } from './zoom.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from "app-shared/kmc-shell";
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { SettingsIntegrationSettingsMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { cancelOnDestroy, KalturaUtils } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kZoomIntegration',
  templateUrl: './zoom.component.html',
  styleUrls: ['./zoom.component.scss'],
  providers: [
    ZoomService,
    KalturaLogger.createLogger('ZoomIntegrationComponent')
  ]
})

export class ZoomComponent implements OnInit, OnDestroy {

  public _currentProfile: KalturaZoomIntegrationSetting = null;
  public _profiles: KalturaZoomIntegrationSetting[];
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;
  public _kmcPermissions = KMCPermissions;
  public totalCount = 0;

  @ViewChild('editProfile', { static: true }) editProfile: PopupWidgetComponent;

  constructor(private _zoomService: ZoomService,
              private _appLocalization: AppLocalization,
              private _logger: KalturaLogger,
              private _settingsIntegrationSettingsMainView: SettingsIntegrationSettingsMainViewService,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
      if (this._settingsIntegrationSettingsMainView.isAvailable()) {
          this._loadZoomIntegrationProfiles();
      }
  }

  ngOnDestroy() {
  }

  public saveProfile(profile: KalturaZoomIntegrationSetting): void {
      this.updateProfile(profile);
  }

  public _onActionSelected({action, profile}: { action: string, profile: KalturaZoomIntegrationSetting }) {
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

  private _loadZoomIntegrationProfiles() {
    this._logger.info(`handle loading integration profiles`);
    this._updateAreaBlockerState(true, null);
    this._zoomService.loadZoomIntegrationProfiles()
      .pipe(cancelOnDestroy(this))
      .subscribe(
        (response: KalturaZoomIntegrationSettingResponse) => {
          this._logger.info(`handle successful loading zoom integration profiles`);
          this._updateAreaBlockerState(false, null);
          this._profiles = response.objects ? response.objects.sort((a,b) => (a.updatedAt > b.updatedAt) ? -1 : ((b.updatedAt > a.updatedAt) ? 1 : 0)) : [];
          this._profiles.forEach(profile => {
              profile.createdAt = (parseInt(profile.createdAt) * 1000).toString();
              profile.updatedAt = (parseInt(profile.updatedAt) * 1000).toString();
          });
          this.totalCount = this._profiles.length;
          if (this.totalCount > 3) {
              this._profiles.splice(3, this.totalCount -3);
          }
        },
        error => {
          this._logger.warn(`handle failed loading zoom integration profiles, show alert`, { errorMessage: error.message });
          const blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.settings.integrationSettings.zoom.loadError'),
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._logger.info(`user selected retry, retry action`);
                  this._loadZoomIntegrationProfiles();
                }
              }
            ]
          });
          this._updateAreaBlockerState(false, blockerMessage);
        }
      );
  }

  private updateProfile(profile: KalturaZoomIntegrationSetting): void {
      this._logger.info(`handle update integration profile`);
      this._updateAreaBlockerState(true, null);
      this._zoomService.updateProfile(profile)
          .pipe(cancelOnDestroy(this))
          .subscribe(
              (response: string) => {
                  this._logger.info(`handle successful update zoom integration profiles`);
                  this._loadZoomIntegrationProfiles();
              },
              error => {
                  this._logger.warn(`handle failed updating zoom integration profile, show alert`, { errorMessage: error.message });
                  const blockerMessage = new AreaBlockerMessage({
                      message: this._appLocalization.get('applications.settings.integrationSettings.zoom.updateError'),
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
