import {Component, OnDestroy, OnInit} from '@angular/core';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {
  AccountInfo,
  AccountInfoService
} from 'applications/settings-integration-settings-app/account-info/account-info.service';


@Component({
  selector: 'kAccountInfo',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
  providers: [AccountInfoService],
})
export class AccountInfoComponent implements OnInit, OnDestroy {


  public _accountInfo: AccountInfo;
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;

  constructor(private _accountInfoService: AccountInfoService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._loadPartnerAccountInfo();
  }

  ngOnDestroy(): void {
  }

  // Get Partner Account Info data
  private _loadPartnerAccountInfo() {
    this._updateAreaBlockerState(true, null);

    this._accountInfoService
      .getAccountInfo()
      .cancelOnDestroy(this)
      .subscribe((response: AccountInfo) => {
          this._accountInfo = response;
          this._updateAreaBlockerState(false, null);

        },
        error => {
          const blockerMessage = new AreaBlockerMessage(
            {
              message: this._appLocalization.get('applications.settings.integrationSettings.accountInfo.errors.loadFailed'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
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
    this._isBusy = isBusy;
    this._blockerMessage = areaBlocker;
  }
}
