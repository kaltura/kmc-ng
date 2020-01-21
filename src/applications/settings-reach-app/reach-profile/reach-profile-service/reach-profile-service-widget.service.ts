import { Injectable } from '@angular/core';
import { ReachProfileWidget } from '../reach-profile-widget';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { SettingsReachProfileViewSections } from "app-shared/kmc-shared/kmc-views/details-views";

@Injectable()
export class ReachProfileServiceWidget extends ReachProfileWidget {
  constructor(logger: KalturaLogger) {
    super(SettingsReachProfileViewSections.Service, logger);
  }


  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {

  }
}
