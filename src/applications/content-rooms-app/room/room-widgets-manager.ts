import { Injectable } from '@angular/core';
import { WidgetsManagerBase } from '@kaltura-ng/kaltura-ui'
import {KalturaMultiRequest, KalturaRoomEntry} from 'kaltura-ngx-client';
import { RoomStore } from './room-store.service';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

@Injectable()
export class RoomWidgetsManager extends WidgetsManagerBase<KalturaRoomEntry, KalturaMultiRequest> {
  private _roomStore: RoomStore;

  constructor(logger: KalturaLogger) {
    super(logger.subLogger('RoomWidgetsManager'));
  }

  set roomStore(value: RoomStore) {
    this._roomStore = value;
  }

  public returnToRooms(): void {
    if (this._roomStore) {
      this._roomStore.returnToRooms();
    }
  }
}
