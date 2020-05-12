import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    KalturaDistributionProfile,
    KalturaDistributionProfileListResponse,
    KalturaDistributionProviderType, KalturaYoutubeApiDistributionProfile
} from 'kaltura-ngx-client';
import { DistributionService } from './distribution.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from "app-shared/kmc-shell";
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { SettingsIntegrationSettingsMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kDistributionProfiles',
  templateUrl: './distribution.component.html',
  styleUrls: ['./distribution.component.scss'],
  providers: [
    DistributionService,
    KalturaLogger.createLogger('DistributionComponent')
  ]
})
export class DistributionComponent implements OnInit, OnDestroy {

  public _currentProfile: KalturaYoutubeApiDistributionProfile = null;
  public _profiles: KalturaDistributionProfile[];
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;
  public _kmcPermissions = KMCPermissions;

  @ViewChild('regenerateTokenPopup', { static: true }) regenerateTokenPopup: PopupWidgetComponent;

  constructor(private _distributionService: DistributionService,
              private _appLocalization: AppLocalization,
              private _logger: KalturaLogger,
              private _settingsIntegrationSettingsMainView: SettingsIntegrationSettingsMainViewService,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
      if (this._settingsIntegrationSettingsMainView.isAvailable()) {
          this._loadDistributionProfiles();
      }
  }

  ngOnDestroy() {
  }

  public _onActionSelected({action, profile}: { action: string, profile: KalturaDistributionProfile }) {
    switch (action) {
      case 'token':
        this._logger.info(`handle edit profile action by user`, { id: profile.id, name: profile.name });
        this._currentProfile = profile as KalturaYoutubeApiDistributionProfile;
        this.regenerateTokenPopup.open();
        break;
      case 'delete':
        this._logger.info(`handle delete profile action by user, show confirmation dialog`);
        this._browserService.confirm(
          {
            header: this._appLocalization.get('applications.settings.integrationSettings.distribution.deleteTitle'),
            message: this._appLocalization
              .get('applications.settings.integrationSettings.distribution.deleteText',
                {0: profile.name}),
            accept: () => {
              this._logger.info(`user confirmed, proceed action`);
              this._deleteProfile(profile);
            },
            reject: () => {
              this._logger.info(`user didn't confirm, abort action`);
            }
          }
        );
        break;
      default:
        break;
    }
  }

  private _deleteProfile(profile: KalturaDistributionProfile) {
    this._logger.info(`handle delete profile request by user`);
    this._updateAreaBlockerState(true, null);
    this._distributionService.deleteProfile(profile.id)
      .pipe(cancelOnDestroy(this))
      .subscribe(
        result => {
          this._logger.info(`handle successful delete profile request by user`);
          this._updateAreaBlockerState(false, null);
          this._loadDistributionProfiles();
        },
        error => {
          this._logger.info(`handle failed delete profile request by user, show confirmation`, { error: error.message });
          const blockerMessage = new AreaBlockerMessage({
            message: error.message || `Error occurred while trying to delete profile \'${profile.name}\'`,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._logger.info(`user selected retry, retry action`);
                  this._deleteProfile(profile);
                }
              }, {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._logger.info(`user canceled, dismiss dialog`);
                  this._blockerMessage = null;
                }
              }
            ]
          });
          this._updateAreaBlockerState(false, blockerMessage);
        }
      );
  }

  private _loadDistributionProfiles() {
    this._logger.info(`handle loading distribution profiles`);
    this._updateAreaBlockerState(true, null);
    this._distributionService.loadDistributionProfiles()
      .pipe(cancelOnDestroy(this))
      .subscribe(
        (response: KalturaDistributionProfileListResponse) => {
          this._logger.info(`handle successful loading distribution profiles`);
          this._updateAreaBlockerState(false, null);
          this._profiles = response.objects ? response.objects.filter(profile => profile.providerType === KalturaDistributionProviderType.youtubeApi) : [];
        },
        error => {
          this._logger.warn(`handle failed loading distribution profiles, show alert`, { errorMessage: error.message });
          const blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.settings.integrationSettings.distribution.loadError'),
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._logger.info(`user selected retry, retry action`);
                  this._loadDistributionProfiles();
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

  public onTokenClick(url: string): void {
      this._browserService.openLink(url);
  }
}
