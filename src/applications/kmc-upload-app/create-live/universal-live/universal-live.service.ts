import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {environment} from 'app-environment';
import {Http} from '@angular/http';

@Injectable()
export class UniversalLiveService {

  private _cachedDefaultIp: string = null;

  constructor(private _http: Http) {
  }

  // return the cached default IP
  public getDefaultIp(): Observable<string> {
    return Observable.create(observer => {
      if (!this._cachedDefaultIp) {
        this._getDefaultIp()
          .subscribe(
            result => {
              this._cachedDefaultIp = result;
              observer.next(this._cachedDefaultIp)
              observer.complete();
            },
            error => {
              observer.error(error);
            }
          );
      } else {
        observer.next(this._cachedDefaultIp)
        observer.complete();
      }
    });
  }

  private _getDefaultIp(): Observable<string> {
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
