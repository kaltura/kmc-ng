import { Injectable } from '@angular/core';
import { ReachProfileWidget } from '../reach-profile-widget';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';

@Injectable()
export class ReachProfileSettingsWidget extends ReachProfileWidget {
  constructor(logger: KalturaLogger) {
    super('reachProfileSettings', logger);
  }


  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {

  }
}
