import {Injectable} from '@angular/core';
import {KalturaClient, KalturaSessionType, SessionStartAction} from 'kaltura-ngx-client';
import {Observable} from 'rxjs';
import {AppAuthentication} from "app-shared/kmc-shell";

@Injectable()
export class GenerateCodeService {

  constructor(private _kalturaServerClient: KalturaClient,
              private appAuthentication: AppAuthentication) {
  }

  public generateCode(): Observable<string> {
    const secret = this.appAuthentication.appUser.partnerInfo.adminSecret;
    const partnerId = this.appAuthentication.appUser.partnerInfo.partnerId;
    return this._kalturaServerClient.request(new SessionStartAction({
        secret,
        partnerId,
        type: KalturaSessionType.admin,
        privileges: 'urirestrict:/api_v3/service/vendor_zoomvendor/action/*'
    }));
  }
}
