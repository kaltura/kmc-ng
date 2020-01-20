import { Injectable } from '@angular/core';
import { ReachProfileWidget } from '../reach-profile-widget';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';

@Injectable()
export class ReachProfileServiceWidget extends ReachProfileWidget {
  constructor(logger: KalturaLogger) {
    super('reachProfileService', logger);
  }


  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {

  }
}
