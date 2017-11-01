import { Injectable } from '@angular/core';
import { PlaylistWidget } from '../playlist-widget';

@Injectable()
export class PlaylistDetailsWidget extends PlaylistWidget {
  constructor() {
    super('playlistDetails');
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
  }

  protected onActivate(firstTimeActivating: boolean): void {
  }

}
