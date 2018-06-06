import {Component, OnDestroy, OnInit} from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {
  AccountInfo,
  AccountInfoService
} from 'applications/settings-integration-settings-app/account-info/account-info.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { SettingsIntegrationSettingsMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
  selector: 'kAccountInfo',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
  providers: [
    AccountInfoService,
    KalturaLogger.createLogger('AccountInfoComponent')
  ],
})
export class AccountInfoComponent implements OnInit, OnDestroy {


  public _accountInfo: AccountInfo;
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;

  constructor(private _accountInfoService: AccountInfoService,
              private _logger: KalturaLogger,
              private _settingsIntegrationSettingsMainView: SettingsIntegrationSettingsMainViewService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
      if (this._settingsIntegrationSettingsMainView.isAvailable()) {
          this._loadPartnerAccountInfo();
      }
  }

  ngOnDestroy(): void {
  }

  // Get Partner Account Info data
  private _loadPartnerAccountInfo() {
    this._logger.info(`handle loading partner account info data`);
    this._updateAreaBlockerState(true, null);

    this._accountInfoService
      .getAccountInfo()
      .cancelOnDestroy(this)
      .subscribe((response: AccountInfo) => {
          this._logger.info(`handle successful loading partner account info data`);
          this._accountInfo = response;
          this._updateAreaBlockerState(false, null);

        },
        error => {
          this._logger.warn(`handle failed loading partner account info data, show alert`, { errorMessage: error.message });
          const blockerMessage = new AreaBlockerMessage(
            {
              message: this._appLocalization.get('applications.settings.integrationSettings.accountInfo.errors.loadFailed'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._logger.info(`user selected retry, retry action`);
                    this._loadPartnerAccountInfo();
                  }
                }
              ]
            }
          );
          this._updateAreaBlockerState(false, blockerMessage);
        });
  }

  private _updateAreaBlockerState(isBusy: boolean, areaBlocker: AreaBlockerMessage): void {
    this._logger.debug(`update areablocker state`, { isBusy, message: areaBlocker ? areaBlocker.message : null });
    this._isBusy = isBusy;
    this._blockerMessage = areaBlocker;
  }
}
