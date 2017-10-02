import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {environment} from 'app-environment';
import {Http} from '@angular/http';

@Injectable()
export class UniversalLiveService {

  constructor(private _http: Http) {
  }

  public loadDefaultIp(): Observable<string> {
    const akamaiEdgeServerIpURL = environment.modules.createLive.akamaiEdgeServerIpURL;
    return this._http.get(window.location.protocol + '//' + akamaiEdgeServerIpURL)
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
