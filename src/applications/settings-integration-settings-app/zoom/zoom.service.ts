import {Injectable, OnDestroy} from '@angular/core';
import {
    KalturaClient,
    KalturaNullableBoolean,
    KalturaZoomIntegrationSetting,
    KalturaZoomIntegrationSettingResponse,
    ZoomVendorListAction,
    ZoomVendorSubmitRegistrationAction
} from 'kaltura-ngx-client';
import {Observable} from 'rxjs';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';

@Injectable()
export class ZoomService implements OnDestroy{

  constructor(private _kalturaServerClient: KalturaClient) {
  }

  public loadZoomIntegrationProfiles(): Observable<KalturaZoomIntegrationSettingResponse> {
    const request = new ZoomVendorListAction();
    return this._kalturaServerClient.request(request).pipe(cancelOnDestroy(this));
  }

  public enableDisableProfile(profile: KalturaZoomIntegrationSetting, enable: boolean): Observable<string> {
      profile.enableRecordingUpload = enable ? KalturaNullableBoolean.trueValue : KalturaNullableBoolean.falseValue;
      const request = new ZoomVendorSubmitRegistrationAction({accountId: profile.accountId, integrationSetting: profile});
      return this._kalturaServerClient.request(request).pipe(cancelOnDestroy(this));
  }

  ngOnDestroy() {
  }

}
