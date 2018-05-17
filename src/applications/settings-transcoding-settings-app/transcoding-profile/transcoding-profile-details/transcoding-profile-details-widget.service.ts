import { Injectable } from '@angular/core';
import { TranscodingProfileWidget } from '../transcoding-profile-widget';

@Injectable()
export class TranscodingProfileDetailsWidget extends TranscodingProfileWidget {
  constructor() {
    super('profileDetails');
  }


  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {

  }
}
