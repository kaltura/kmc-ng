import { Injectable } from '@angular/core';
import { WidgetsManagerBase } from '@kaltura-ng/kaltura-ui';
import { TranscodingProfileStore } from './transcoding-profile-store.service';
import { KalturaMultiRequest } from 'kaltura-ngx-client';
import { KalturaConversionProfileWithAsset } from '../transcoding-profiles-store/base-transcoding-profiles-store.service';

@Injectable()
export class TranscodingProfileWidgetsManager extends WidgetsManagerBase<KalturaConversionProfileWithAsset, KalturaMultiRequest> {
  private _profileStore: TranscodingProfileStore;

  constructor() {
    super();
  }

  set profileStore(value: TranscodingProfileStore) {
    this._profileStore = value;
  }

  public returnToProfiles(): void {
    if (this._profileStore) {
      this._profileStore.returnToProfiles();
    }
  }
}
