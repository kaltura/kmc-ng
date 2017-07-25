import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { PlaylistsStore } from '../playlists-store/playlists-store.service';
import { PlaylistDeleteAction } from 'kaltura-typescript-client/types/PlaylistDeleteAction';
import { KalturaRequest, KalturaMultiRequest, KalturaMultiResponse } from 'kaltura-typescript-client';
import { environment } from 'app-environment';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class BulkDeleteService {
  private _stateDelete = new BehaviorSubject<{loading : boolean}>({ loading : false});
  public stateDelete$ = this._stateDelete.asObservable();

  constructor(
    public _playlistsStore: PlaylistsStore,
    public _kalturaServerClient: KalturaClient
  ) {}

  public deletePlaylist(ids: any): Observable<{}>{
    return Observable.create(observer =>{
      this._stateDelete.next({loading: true});
      let requests: PlaylistDeleteAction[] = [];
      if(ids) {
        ids.forEach(id => requests.push(new PlaylistDeleteAction({ id: id })));
      } else {
        // TODO [kmc] missing implementation
      }
      if(requests.length) {
        this._transmit(requests).subscribe(
          () => {
            this._stateDelete.next({loading: false});
            this._playlistsStore.reload(true);
            observer.next({});
            observer.complete();
          },
          error => {
            this._stateDelete.next({loading: false});
            observer.error(error);
          }
        );
      } else {
        this._stateDelete.next({loading: false});
      }
    });
  }

  private _transmit(requests : KalturaRequest<any>[]) : Observable<{}> {
    let multiRequests: Observable<KalturaMultiResponse>[] = [];
    let mr :KalturaMultiRequest = new KalturaMultiRequest();

    for (let i = 0; i < requests.length; i++){
      multiRequests.push(this._kalturaServerClient.multiRequest(mr));
      mr = new KalturaMultiRequest();
      mr.requests.push(requests[i]);
    }

    multiRequests.push(this._kalturaServerClient.multiRequest(mr));

    return Observable.forkJoin(multiRequests)
      .map(responses => {
        const mergedResponses = [].concat.apply([], responses);
        let hasFailure = mergedResponses.filter(function ( response ) {return response.error}).length > 0;
        if (hasFailure) {
          throw new Error("error");
        } else {
          return {};
        }
      });
  }
}
