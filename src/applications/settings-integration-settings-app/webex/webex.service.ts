import {Injectable, OnDestroy} from '@angular/core';
import {
    KalturaClient,
    KalturaWebexAPIIntegrationSetting,
    KalturaWebexAPIIntegrationSettingResponse,
    WebexVendorListAction,
    WebexVendorSubmitRegistrationAction
} from 'kaltura-ngx-client';
import {Observable} from 'rxjs';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';

@Injectable()
export class WebexService implements OnDestroy{

  constructor(private _kalturaServerClient: KalturaClient) {
  }

  public loadWebexIntegrationProfiles(): Observable<KalturaWebexAPIIntegrationSettingResponse> {
    const request = new WebexVendorListAction();
    return this._kalturaServerClient.request(request).pipe(cancelOnDestroy(this));
  }

  public updateProfile(profile: KalturaWebexAPIIntegrationSetting): Observable<string> {
      const request = new WebexVendorSubmitRegistrationAction({accountId: profile.accountId, integrationSetting: profile});
      return this._kalturaServerClient.request(request).pipe(cancelOnDestroy(this));
  }

  ngOnDestroy() {
  }

}
