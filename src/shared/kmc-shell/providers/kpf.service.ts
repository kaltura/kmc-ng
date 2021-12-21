import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverConfig } from 'config/server';
import { BrowserService } from "./browser.service";
import { AppAuthentication } from "../auth/app-authentication.service";
import { HttpClient } from "@angular/common/http";
import {AppLocalization} from "@kaltura-ng/mc-shared";

export enum KPFLoginRedirects {
    login = "login",
    overview = "overview",
    billing = "billing",
    upgrade = "upgrade_vpaas",
}

@Injectable()
export class KPFService {

  constructor(private _browserService: BrowserService,
              private _appAuthentication: AppAuthentication,
              private _appLocalization: AppLocalization,
              private _http: HttpClient) {}

  private _kpfPackageManagerBaseUrl = serverConfig.kpfServer.kpfPackageManagerBaseUrl;
  private _kpfPurchaseManagerBaseUrl = serverConfig.kpfServer.kpfPurchaseManagerBaseUrl;

  private getJWTToken(): Observable<any> {
      const ks = this._appAuthentication.appUser.ks;
      const partnerInfo = this._appAuthentication.appUser.partnerInfo;
      return this._http.post(`${this._kpfPurchaseManagerBaseUrl}/partner/loginByKs/${partnerInfo.partnerId}/short`, {ks});
  }

  public openKPF(path = '') : Observable<boolean> {
      return new Observable<boolean>(observer =>
      {
          this.getJWTToken().subscribe(response => {
              if (response.access_token && response.access_token.length) {
                  console.log(`${this._kpfPurchaseManagerBaseUrl}/partner/login/${response.access_token}/${path}`);
                  this._browserService.openLink(`${this._kpfPurchaseManagerBaseUrl}/partner/login/${response.access_token}/${path}`);
                  observer.next(true);
              } else {
                  observer.next(false);
              }
              observer.complete();
          }, error => {
              observer.error(error)
              observer.complete()
          });
      });
  }
  public getCredits() : Observable<string> {
      return new Observable<string>(observer =>
      {
          const ks = this._appAuthentication.appUser.ks;
          const partnerInfo = this._appAuthentication.appUser.partnerInfo;
          this._http.post(`${this._kpfPurchaseManagerBaseUrl}/partner/credit/${partnerInfo.partnerId}`, {ks}).subscribe((response: any) => {
              if (typeof response.credit !== "undefined") {
                  observer.next(response.credit.toString());
              } else {
                  observer.next('');
              }
          }, error => {
              observer.next('');
              observer.complete()
          });
      });
  }

}
