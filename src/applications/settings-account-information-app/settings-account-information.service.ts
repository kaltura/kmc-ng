import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {environment} from 'app-environment';
import {Http} from '@angular/http';
import {KalturaClient} from 'kaltura-ngx-client';
import {KalturaPartnerStatistics} from 'kaltura-ngx-client/api/types/KalturaPartnerStatistics';
import {PartnerGetStatisticsAction} from 'kaltura-ngx-client/api/types/PartnerGetStatisticsAction';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {KalturaLogger} from "@kaltura-ng/kaltura-logger";


export interface AccountInformation {
  name: string;
  phone: string;
  comments: string;
}

@Injectable()
export class SettingsAccountInformationService {

  constructor(private _http: Http, private _kalturaServerClient: KalturaClient, private _appLocalization: AppLocalization, private _logger: KalturaLogger) {
  }

  public sendContactSalesForceInformation(data: AccountInformation): Observable<void> {
    return this._http
      .post(environment.core.kaltura.contactsalesforce, data)
      .map(() => undefined);
  }

  public getStatistics(): Observable<{ bandwidth: string, storage: string }> {
    return this._kalturaServerClient.request(new PartnerGetStatisticsAction())
      .map((response: KalturaPartnerStatistics) => ({
          bandwidth: response.bandwidth ? response.bandwidth.toFixed(2) : this._appLocalization.get('app.common.n_a'),
          storage: response.hosting ? response.hosting.toFixed(2) : this._appLocalization.get('app.common.n_a')
        })
      )
      .catch(() => {
        this._logger.warn(`cannot load bandwidth and monthly storage information`);
        return Observable.of({
          bandwidth: this._appLocalization.get('app.common.n_a'),
          storage: this._appLocalization.get('app.common.n_a')
        });
      });
    ;
  }
}
