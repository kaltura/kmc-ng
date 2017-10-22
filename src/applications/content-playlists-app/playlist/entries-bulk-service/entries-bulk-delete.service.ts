import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
// import { PlaylistsStore } from '../playlists-store/playlists-store.service';
import { PlaylistDeleteAction } from 'kaltura-typescript-client/types/PlaylistDeleteAction';
import { KalturaRequest, KalturaMultiRequest, KalturaMultiResponse } from 'kaltura-typescript-client';
import { environment } from 'app-environment';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { BaseEntryDeleteAction } from 'kaltura-typescript-client/types/BaseEntryDeleteAction';

@Injectable()
export class EntriesBulkDeleteService {
  // private _stateDelete = new BehaviorSubject<{loading : boolean}>({ loading : false});
  // public stateDelete$ = this._stateDelete.asObservable();

  constructor(
    // public _playlistsStore: PlaylistsStore,
    public _kalturaServerClient: KalturaClient
  ) {}

  public deleteEntries(ids: string[]): Observable<void>{
    return Observable.create(observer =>{
      //this._stateDelete.next({loading: true});
      let requests: BaseEntryDeleteAction[] = [];
      if(ids && ids.length > 0) {
        ids.forEach(id => requests.push(new BaseEntryDeleteAction({ entryId: id })));
        this._transmit(requests, true).subscribe(
          () => {
            // this._stateDelete.next({loading: false});
            observer.next({});
            observer.complete();
          },
          error => {
            // this._stateDelete.next({loading: false});
            observer.error(error);
          }
        );
      } else {
        // this._stateDelete.next({loading: false});
        observer.next({});
        observer.complete();
      }
    });
  }

  private _transmit(requests : KalturaRequest<any>[], chunk : boolean) : Observable<{}> {
    let maxRequestsPerMultiRequest = requests.length;
    if (chunk){
      maxRequestsPerMultiRequest = environment.modules.contentPlaylists.bulkActionsLimit;
    }

    let multiRequests: Observable<KalturaMultiResponse>[] = [];
    let mr :KalturaMultiRequest = new KalturaMultiRequest();

    let counter = 0;
    for (let i = 0; i < requests.length; i++){
      if (counter === maxRequestsPerMultiRequest){
        multiRequests.push(this._kalturaServerClient.multiRequest(mr));
        mr = new KalturaMultiRequest();
        counter = 0;
      }
      mr.requests.push(requests[i]);
      counter++;
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
