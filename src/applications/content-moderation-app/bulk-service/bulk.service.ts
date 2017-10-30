import { Injectable, OnDestroy } from '@angular/core';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { BaseEntryApproveAction } from 'kaltura-typescript-client/types/BaseEntryApproveAction';
import { Observable } from 'rxjs/Observable';
import { BaseEntryRejectAction } from 'kaltura-typescript-client/types/BaseEntryRejectAction';
import { KalturaMultiRequest, KalturaMultiResponse, KalturaRequest } from 'kaltura-typescript-client';
import { environment } from 'app-environment';

@Injectable()
export class BulkService implements OnDestroy {
  constructor(
    private _kalturaServerClient: KalturaClient,
    private _appLocalization: AppLocalization
  ) {}

  approveEntry(entryIds: string[]): Observable<void> {
    return Observable.create(observer => {
      let requests: BaseEntryApproveAction[] = [];
      entryIds.forEach(entryId => requests.push(new BaseEntryApproveAction({entryId: entryId})));
      this._transmit(requests, true).subscribe(
        () => {
          observer.next({});
          observer.complete();
        },
        error => {
          observer.error(new Error(this._appLocalization.get('applications.content.moderation.errorConnecting')));
        });
    });
  }

  private _transmit(requests : KalturaRequest<any>[], chunk : boolean) : Observable<{}> {
    let maxRequestsPerMultiRequest = requests.length;
    if (chunk){
      maxRequestsPerMultiRequest = environment.modules.contentModeration.bulkActionsLimit;
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
        let hasFailure = [...responses[0]].filter(function ( response ) {return response.error}).length > 0;
        if (hasFailure) {
          throw new Error("error");
        } else {
          return {};
        }
      });
  }

  rejectEntry(entryIds: string[]): Observable<void> {
    return Observable.create(observer => {
      let requests: BaseEntryRejectAction[] = [];
      entryIds.forEach(entryId => requests.push(new BaseEntryRejectAction({entryId: entryId})));
      this._transmit(requests, true).subscribe(
        () => {
          observer.next({});
          observer.complete();
        },
        error => {
          observer.error(new Error(this._appLocalization.get('applications.content.moderation.errorConnecting')));
        });
    });
  }

  ngOnDestroy() {}
}

