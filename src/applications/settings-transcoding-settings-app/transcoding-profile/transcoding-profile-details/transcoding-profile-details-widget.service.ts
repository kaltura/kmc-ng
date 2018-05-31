import { Injectable } from '@angular/core';
import { TranscodingProfileWidget } from '../transcoding-profile-widget';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

@Injectable()
export class TranscodingProfileDetailsWidget extends TranscodingProfileWidget {
  constructor(logger: KalturaLogger) {
    super('profileDetails', logger);
  }


  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {

  }
}
