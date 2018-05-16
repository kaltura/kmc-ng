import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {Http} from '@angular/http';
import {KalturaClient} from 'kaltura-ngx-client';
import {KalturaPartnerStatistics} from 'kaltura-ngx-client/api/types/KalturaPartnerStatistics';
import {PartnerGetStatisticsAction} from 'kaltura-ngx-client/api/types/PartnerGetStatisticsAction';
import { serverConfig } from 'config/server';


export interface AccountInformation {
  name: string;
  phone: string;
  comments: string;
}

@Injectable()
export class SettingsAccountInformationService {

  constructor(private _http: Http, private _kalturaServerClient: KalturaClient) {
  }

  public canContactSalesForceInformation(): boolean {
    try {
      return !!serverConfig.externalLinks.kaltura && !!serverConfig.externalLinks.kaltura.contactSalesforce;
    } catch (ex) {
      return false;
    }
  }

  public sendContactSalesForceInformation(data: AccountInformation): Observable<void> {
    try {
      return this._http
        .post(serverConfig.externalLinks.kaltura.contactSalesforce, data)
        .map(() => undefined);
    } catch (ex) {
      return Observable.throw(new Error('An error occurred while trying to contact SalesForce'));
    }
  }

  public getStatistics(): Observable<KalturaPartnerStatistics> {
    return this._kalturaServerClient.request(new PartnerGetStatisticsAction());
  }
}
