import { Injectable } from '@angular/core';
import { KalturaClient } from 'kaltura-ngx-client';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { KalturaConversionProfile } from 'kaltura-ngx-client/api/types/KalturaConversionProfile';
import { TranscodingProfileWidget } from '../transcoding-profile-widget';


@Injectable()
export class TranscodingProfileDetailsWidget extends TranscodingProfileWidget {
  public _landingPage: string;

  constructor(kalturaServerClient: KalturaClient,
              private appAuthentication: AppAuthentication) {
    super('profileDetails');
  }


  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {

  }

  protected onActivate(firstTimeActivating: boolean): void {
    const profile: KalturaConversionProfile = this.data;

    this._landingPage = null;

    let landingPage = this.appAuthentication.appUser.partnerInfo.landingPage;
    if (landingPage) {
      landingPage = landingPage.replace('{profileId}', String(profile.id));
      if (landingPage.indexOf('http') !== 0) {
        landingPage = 'http://' + landingPage;
      }
    }
    this._landingPage = landingPage;
  }
}
