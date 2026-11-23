import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { KalturaBaseEntry, KalturaClient, KalturaPlaylist, PlaylistGetAction, PlaylistUpdateAction } from 'kaltura-ngx-client';
import { BulkActionBaseService } from './bulk-action-base.service';

@Injectable()
export class BulkAddToPlaylistService extends BulkActionBaseService<KalturaPlaylist> {

  constructor(_kalturaServerClient: KalturaClient) {
    super(_kalturaServerClient);
  }

  // appends the selected entries to an existing manual playlist. Entries already in the playlist are skipped.
  // emits the number of entries that were added
  public execute(selectedEntries: KalturaBaseEntry[], playlist: KalturaPlaylist): Observable<number> {
    // reload the playlist to make sure we append to its latest content
    return this._kalturaServerClient.request(new PlaylistGetAction({ id: playlist.id }))
      .pipe(switchMap(currentPlaylist => {
        const currentIds = (currentPlaylist.playlistContent || '').split(',').map(id => id.trim()).filter(Boolean);
        const newIds = Array.from(new Set(selectedEntries.map(({ id }) => id))).filter(id => currentIds.indexOf(id) === -1);
        if (!newIds.length) {
          return of(0);
        }
        return this._kalturaServerClient.request(new PlaylistUpdateAction({
          id: playlist.id,
          playlist: new KalturaPlaylist({ playlistContent: [...currentIds, ...newIds].join(',') })
        })).pipe(map(() => newIds.length));
      }));
  }
}
