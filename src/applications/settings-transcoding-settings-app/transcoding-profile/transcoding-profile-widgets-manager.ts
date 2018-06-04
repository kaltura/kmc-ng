import { Injectable } from '@angular/core';
import { WidgetsManagerBase } from '@kaltura-ng/kaltura-ui';
import { TranscodingProfileStore } from './transcoding-profile-store.service';
import { KalturaMultiRequest } from 'kaltura-ngx-client';
import { KalturaConversionProfileWithAsset } from '../transcoding-profiles/transcoding-profiles-store/base-transcoding-profiles-store.service';

import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

@Injectable()
export class TranscodingProfileWidgetsManager extends WidgetsManagerBase<KalturaConversionProfileWithAsset, KalturaMultiRequest> {
  private _profileStore: TranscodingProfileStore;

  constructor(logger: KalturaLogger) {
    super(logger.subLogger('TranscodingProfileWidgetsManager'));
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
