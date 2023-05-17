import { Injectable } from '@angular/core';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { WidgetsManagerBase } from '@kaltura-ng/kaltura-ui'
import { KalturaMultiRequest } from 'kaltura-ngx-client';
import { KalturaPlaylist } from 'kaltura-ngx-client';
import { RoomStore } from './room-store.service';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

@Injectable()
export class RoomWidgetsManager extends WidgetsManagerBase<KalturaPlaylist, KalturaMultiRequest> {
  private _roomStore: RoomStore;

  constructor(logger: KalturaLogger) {
    super(logger.subLogger('PlaylistWidgetsManager'));
  }

  set playlistStore(value: RoomStore) {
    this._roomStore = value;
  }

  public returnToPlaylists(): void {
    if (this._roomStore) {
      this._roomStore.returnToPlaylists();
    }
  }
}
