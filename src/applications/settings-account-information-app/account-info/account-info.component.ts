import {Component, OnDestroy, OnInit} from '@angular/core';
import {SettingsAccountInformationService} from '../settings-account-information.service';
import {AppAuthentication, PartnerPackageTypes} from 'app-shared/kmc-shell';
import {DatePipe} from '@kaltura-ng/kaltura-ui';
import {KalturaPartnerStatistics} from 'kaltura-ngx-client/api/types/KalturaPartnerStatistics';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import { SettingsAccountInformationMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { serverConfig } from 'config/server';


@Component({
  selector: 'kAccountInfo',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
  providers: [KalturaLogger.createLogger('AccountInfoComponent')]
})
export class AccountInfoComponent implements OnInit, OnDestroy {
  public _isBusy = false;
  public _bandwidth = '';
  public _bandwidthNA = false;
  public _storage = '';
  public _storageNA = false;
  public _showTrialUserInfo: boolean;
  public _trialExpirationDateString = '';

  constructor(private _accountInformationService: SettingsAccountInformationService,
              private _appAuthentication: AppAuthentication,
              private _appLocalization: AppLocalization,
              private _logger: KalturaLogger,
              private _settingsAccountInformationMainView: SettingsAccountInformationMainViewService) {
  }

  ngOnInit() {
    this._logger.info(`initiate accont information view`);
    this._showTrialUserInfo = this._appAuthentication.appUser.partnerInfo.partnerPackage === PartnerPackageTypes.PartnerPackageFree
        && serverConfig.kalturaServer.freeTrialExpiration.enabled
        && !!this._appAuthentication.appUser.createdAt;
    if (this._showTrialUserInfo) {
      const trialPeriod: number = serverConfig.kalturaServer.freeTrialExpiration.trialPeriodInDays;

      this._trialExpirationDateString =
        (new DatePipe()).transform(this._appAuthentication.appUser.createdAt.getTime() + trialPeriod, 'dateOnly'); // "01/15/1992"
    }
    if (this._settingsAccountInformationMainView.isAvailable()) {
        this.loadStatistics();
    }
  }

  private loadStatistics() {
    this._logger.info(`handle loading statistics data`);
    this._isBusy = true;
    this._accountInformationService.getStatistics()
      .cancelOnDestroy(this)
      .subscribe((response: KalturaPartnerStatistics) => {
        this._isBusy = false;
        this._bandwidthNA = typeof response.bandwidth !== 'number';
        this._storageNA = typeof response.hosting !== 'number';
        this._bandwidth = !this._bandwidthNA ? response.bandwidth.toFixed(2) : this._appLocalization.get('app.common.n_a');
        this._storage = !this._storageNA ? response.hosting.toFixed(2) : this._appLocalization.get('app.common.n_a');
        this._logger.info(`handle successful loading statistics data`, { bandwidth: this._bandwidth, storage: this._storage });
      }, error => {
        this._logger.warn(`handle failed loading statistics data`, { errorMessage: error.message });
        this._isBusy = false;
          this._bandwidthNA = true;
          this._storageNA = true;
        this._bandwidth = this._appLocalization.get('app.common.n_a');
        this._storage = this._appLocalization.get('app.common.n_a');
      });
  }

  ngOnDestroy() {
  }
}
