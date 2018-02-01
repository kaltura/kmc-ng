import {Component, OnDestroy, OnInit} from '@angular/core';
import {SettingsAccountInformationService} from '../settings-account-information.service';
import {AppAuthentication, PartnerPackageTypes} from 'app-shared/kmc-shell';
import {DatePipe} from '@kaltura-ng/kaltura-ui';
import {environment} from 'app-environment';


@Component({
  selector: 'kAccountInfo',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss']
})
export class AccountInfoComponent implements OnInit, OnDestroy {
  public _isBusy = false;
  public _bandwidth = '';
  public _storage = '';
  public _showTrialUserInfo: boolean;
  public _trialExpirationDateString = '';

  constructor(private _accountInformationService: SettingsAccountInformationService, private _appAuthentication: AppAuthentication) {
  }

  ngOnInit() {
    this._showTrialUserInfo = this._appAuthentication.appUser.partnerInfo.partnerPackage === PartnerPackageTypes.PartnerPackageFree &&
      environment.modules.settingsAccountInformation.checkFreeTrialExpiration;
    if (this._showTrialUserInfo) {
      const trialPeriod: number = environment.modules.settingsAccountInformation.trialPeriod;

      this._trialExpirationDateString =
        (new DatePipe()).transform(this._appAuthentication.appUser.createdAt.getTime() + trialPeriod, 'MM/DD/YYYY'); // "01/15/1992"
    }
    this.loadStatistics();
  }

  private loadStatistics() {
    this._isBusy = true;
    this._accountInformationService.getStatistics()
      .cancelOnDestroy(this)
      .subscribe(({bandwidth, storage}) => {
        this._isBusy = false;
        this._bandwidth = bandwidth;
        this._storage = storage;
      });
  }

  ngOnDestroy() {
  }
}
