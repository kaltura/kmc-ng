import { Injectable } from '@angular/core';
import { WidgetsManagerBase } from '@kaltura-ng/kaltura-ui';
import { TranscodingProfileStore } from './transcoding-profile-store.service';
import { KalturaMultiRequest } from 'kaltura-ngx-client';
import { KalturaConversionProfile } from 'kaltura-ngx-client/api/types/KalturaConversionProfile';

@Injectable()
export class TranscodingProfileWidgetsManager extends WidgetsManagerBase<KalturaConversionProfile, KalturaMultiRequest> {
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
