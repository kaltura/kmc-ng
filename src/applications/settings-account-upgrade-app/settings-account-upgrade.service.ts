import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { subApplicationsConfig } from 'config/sub-applications';
import {Http} from '@angular/http';


export interface AccountUpgrade {
  name: string;
  phone: string;
  comments: string;
}

@Injectable()
export class SettingsAccountUpgradeService {

  constructor(private _http: Http) {
  }

  /** update the */
  public sendContactSalesForceInformation(data: AccountUpgrade): Observable<any> {
    return this._http
      .post(subApplicationsConfig.core.kaltura.contactsalesforce, data);
  }
}
