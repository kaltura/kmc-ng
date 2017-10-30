import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { PlaylistsStore } from '../playlists-store/playlists-store.service';
import { PlaylistDeleteAction } from 'kaltura-typescript-client/types/PlaylistDeleteAction';
import { KalturaRequest } from 'kaltura-typescript-client';
import { environment } from 'app-environment';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import * as R from 'ramda';

@Injectable()
export class BulkDeleteService {
  constructor(public _playlistsStore: PlaylistsStore, public _kalturaServerClient: KalturaClient) {
  }

  public deletePlaylist(ids: string[]): Observable<{}> {
    if (!ids || ids.length <= 0) {
      return Observable.empty();
    }

    return this._transmit(ids.map(id => new PlaylistDeleteAction({ id })), true);
  }

  private _transmit(requests: KalturaRequest<any>[], chunk: boolean): Observable<{}> {
    let maxRequestsPerMultiRequest = requests.length;
    if (chunk) {
      maxRequestsPerMultiRequest = environment.modules.contentPlaylists.bulkActionsLimit || requests.length;
    }

    // splitEvery=> [[], [], ...], each of inner arrays has length of maxRequestsPerMultiRequest
    const multiRequests = R.splitEvery(maxRequestsPerMultiRequest, requests)
      .map(reqChunk => this._kalturaServerClient.multiRequest(reqChunk));

    return Observable.forkJoin(multiRequests)
      .map(responses => {
        const errorMessage = [].concat.apply([], responses)
          .filter(response => !!response.error)
          .reduce((acc, { error }) => `${acc}\n${error.message}`, '')
          .trim();

        if (!!errorMessage) {
          throw new Error(errorMessage);
        } else {
          return {};
        }
      });
  }
}
