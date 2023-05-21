import { Injectable } from '@angular/core';
import { RoomWidget } from '../room-widget';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

@Injectable()
export class RoomDetailsWidget extends RoomWidget {
  constructor(logger: KalturaLogger) {
    super('roomDetails', logger);
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
  }
}
