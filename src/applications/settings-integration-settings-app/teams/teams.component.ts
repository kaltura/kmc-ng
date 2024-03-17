import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { KalturaNullableBoolean } from 'kaltura-ngx-client';
import {LoadTeamsIntegrationResponse, TeamsIntegration, TeamsService} from './teams.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from "app-shared/kmc-shell";
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { SettingsIntegrationSettingsMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kTeamsIntegration',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
  providers: [
    TeamsService,
    KalturaLogger.createLogger('TeamsIntegrationComponent')
  ]
})

export class TeamsComponent implements OnInit, OnDestroy {

  public _currentProfile: TeamsIntegration = null;
  public _profiles: TeamsIntegration[];
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;
  public _kmcPermissions = KMCPermissions;
  public totalCount = 0;

  @ViewChild('editProfile', { static: true }) editProfile: PopupWidgetComponent;

  constructor(private _appLocalization: AppLocalization,
              private _logger: KalturaLogger,
              private _teamsService: TeamsService,
              private _settingsIntegrationSettingsMainView: SettingsIntegrationSettingsMainViewService) {
  }

  ngOnInit() {
      if (this._settingsIntegrationSettingsMainView.isAvailable()) {
          this._loadTeamsIntegrationProfiles();
      }
  }

  ngOnDestroy() {
  }

  public saveProfile(profile: any): void {
      this.updateProfile(profile);
  }

  public _onActionSelected({action, profile}: { action: string, profile: TeamsIntegration }) {
    switch (action) {
      case 'edit':
        this._logger.info('handle edit profile action by user');
        this._currentProfile = profile;
        this.editProfile.open();
        break;
      case 'enable':
        // this._logger.info(`handle enable profile action by user`, { userId: profile.defaultUserId, accountId: profile.accountId });
        // profile.enableRecordingUpload = KalturaNullableBoolean.trueValue;
        // this.updateProfile(profile);
        // break;
      case 'disable':
        // this._logger.info(`handle disable profile action by user`, { userId: profile.defaultUserId, accountId: profile.accountId });
        //   profile.enableRecordingUpload = KalturaNullableBoolean.falseValue;
        // this.updateProfile(profile);
        break;
      default:
        break;
    }
  }

  private _loadTeamsIntegrationProfiles() {
    this._logger.info(`handle loading integration profiles`);
    this._updateAreaBlockerState(true, null);
    const filter = {
          orderBy: "createdAt"
    }
    this._teamsService.loadTeamsIntegrationProfiles(filter)
      .pipe(cancelOnDestroy(this))
      .subscribe(
        (response: LoadTeamsIntegrationResponse) => {
          this._logger.info(`handle successful loading teams integration profiles`);
          this._updateAreaBlockerState(false, null);
          this._profiles = response.objects || [];
          this.totalCount = this._profiles.length;
        },
        error => {
          this._logger.warn(`handle failed loading teams integration profiles, show alert`, { errorMessage: error.message });
          const blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.settings.integrationSettings.teams.loadError'),
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._logger.info(`user selected retry, retry action`);
                  this._loadTeamsIntegrationProfiles();
                }
              }
            ]
          });
          this._updateAreaBlockerState(false, blockerMessage);
        }
      );
  }

  private updateProfile(profile: any): void {
      this._logger.info(`handle update integration profile`);
      this._updateAreaBlockerState(true, null);
      this._teamsService.updateProfile(profile)
          .pipe(cancelOnDestroy(this))
          .subscribe(
              (response: string) => {
                  this._logger.info(`handle successful update teams integration profiles`);
                  this._loadTeamsIntegrationProfiles();
              },
              error => {
                  this._logger.warn(`handle failed updating teams integration profile, show alert`, { errorMessage: error.message });
                  const blockerMessage = new AreaBlockerMessage({
                      message: this._appLocalization.get('applications.settings.integrationSettings.teams.updateError'),
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

  public onProfileCreated(profile: TeamsIntegration): void {
      debugger;
  }

  private _updateAreaBlockerState(isBusy: boolean, areaBlocker: AreaBlockerMessage): void {
    this._logger.debug(`update areablocker state`, { isBusy, message: areaBlocker ? areaBlocker.message : null });
    this._isBusy = isBusy;
    this._blockerMessage = areaBlocker;
  }

}
