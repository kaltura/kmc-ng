import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {environment} from 'app-environment';
import {Http} from '@angular/http';


export interface AccountInformation {
  name: string;
  phone: string;
  comments: string;
}

@Injectable()
export class SettingsAccountInformationService {

  constructor(private _http: Http) {
  }

  /** update the */
  public sendContactSalesForceInformation(data: AccountInformation): Observable<any> {
    return this._http
      .post(environment.core.kaltura.contactsalesforce, data);
  }
}
