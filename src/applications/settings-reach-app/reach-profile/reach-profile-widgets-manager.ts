import { Injectable } from '@angular/core';
import { WidgetsManagerBase } from '@kaltura-ng/kaltura-ui';
import { ReachProfileStore } from './reach-profile-store.service';
import { KalturaMultiRequest, KalturaReachProfile } from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';

@Injectable()
export class ReachProfileWidgetsManager extends WidgetsManagerBase<KalturaReachProfile, KalturaMultiRequest> {
  private _profileStore: ReachProfileStore;

  constructor(logger: KalturaLogger) {
    super(logger.subLogger('ReachProfileWidgetsManager'));
  }

  set profileStore(value: ReachProfileStore) {
    this._profileStore = value;
  }

  public returnToProfiles(): void {
    if (this._profileStore) {
      this._profileStore.returnToProfiles();
    }
  }
}
