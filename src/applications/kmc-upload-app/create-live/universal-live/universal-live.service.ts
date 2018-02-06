import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import { subApplicationsConfig } from 'config/sub-applications';
import {Http} from '@angular/http';

@Injectable()
export class UniversalLiveService {

  constructor(private _http: Http) {
  }

  public getDefaultIp(): Observable<string> {
    let akamaiEdgeServerIpURL = subApplicationsConfig.modules.createLive.akamaiEdgeServerIpURL;
    const pattern = /^https?:\/\//;

    if (!pattern.test(akamaiEdgeServerIpURL)) {
      akamaiEdgeServerIpURL = window.location.protocol + '//' + akamaiEdgeServerIpURL;
    }

    return this._http.get(akamaiEdgeServerIpURL)
      .map(res => {
        // extract the IP from the text of the response
        const defaultIP = res.text();
        const match = defaultIP.match(/<serverip>(.*)<\/serverip>/);
        if (match.length > 1) {
          return match[1];
        }

        return '';
      });
  }
}
