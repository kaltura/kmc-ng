import { Injectable } from '@angular/core';
import { PlaylistWidget } from '../playlist-widget';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
@Injectable()
export class PlaylistDetailsWidget extends PlaylistWidget {
  constructor(logger: KalturaLogger) {
    super('playlistDetails', logger);
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
  }
}
