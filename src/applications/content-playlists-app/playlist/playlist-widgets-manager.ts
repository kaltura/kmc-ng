import { Injectable } from '@angular/core';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { WidgetsManagerBase } from '@kaltura-ng/kaltura-ui'
import { KalturaMultiRequest } from '@kaltura-ng/kaltura-client';
import { KalturaPlaylist } from '@kaltura-ng/kaltura-client/api/types/KalturaPlaylist';
import { PlaylistStore } from './playlist-store.service';

@Injectable()
export class PlaylistWidgetsManager extends WidgetsManagerBase<KalturaPlaylist, KalturaMultiRequest> {
  private _playlistStore: PlaylistStore;

  constructor() {
    super();
  }

  set playlistStore(value: PlaylistStore) {
    this._playlistStore = value;
  }

  public returnToPlaylists(): void {
    if (this._playlistStore) {
      this._playlistStore.returnToPlaylists();
    }
  }
}
