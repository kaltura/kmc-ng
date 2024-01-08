import { Injectable } from '@angular/core';
import { Observable, throwError as ObservableThrowError } from 'rxjs';
import { map } from 'rxjs/operators';
import {KalturaClient, BaseEntryDeleteAction, RoomUpdateAction, KalturaRoomEntry} from 'kaltura-ngx-client';

@Injectable()
export class ContentDocumentsAppService {
  constructor(private _kalturaServerClient: KalturaClient) {

  }

  public deleteRecording(roomId: string, entryId: string): Observable<void> {
      if (!entryId || !roomId) {
          return ObservableThrowError('missing room id or entry id argument');
      }
      const unlinkRecordingAction = new RoomUpdateAction({roomId, room: new KalturaRoomEntry({redirectEntryId: null})});
      const deleteRecordingAction = new BaseEntryDeleteAction({ entryId: entryId });
      return this._kalturaServerClient
          .multiRequest([unlinkRecordingAction, deleteRecordingAction])
          .pipe(map(() => {}));
  }
}
