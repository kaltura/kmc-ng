import { Injectable, OnDestroy } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { environment } from 'app-environment';
import { KalturaClient, KalturaMultiRequest, KalturaMultiResponse, KalturaRequest } from 'kaltura-ngx-client';
import { BaseEntryApproveAction } from 'kaltura-ngx-client/api/types/BaseEntryApproveAction';
import { BaseEntryRejectAction } from 'kaltura-ngx-client/api/types/BaseEntryRejectAction';

@Injectable()
export class BulkService implements OnDestroy {
  constructor(private _kalturaServerClient: KalturaClient,
              private _appLocalization: AppLocalization) {
  }

  approveEntry(entryIds: string[]): Observable<void> {
    return Observable.create(observer => {
      let subscription: ISubscription,
        requests: BaseEntryApproveAction[] = [];
      if (entryIds && entryIds.length) {
        entryIds.forEach(entryId => requests.push(new BaseEntryApproveAction({ entryId: entryId })));
        subscription = this._transmit(requests, true).subscribe(
          () => {
            observer.next(undefined);
            observer.complete();
          },
          error => {
            observer.error(new Error(error && error.message ? error.message : typeof error === 'string' ? error : this._appLocalization.get('applications.content.moderation.errorConnecting')));
          });
      } else {
        observer.error(new Error('missing entryIds argument'));
      }
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      }
    });
  }

  private _transmit(requests: KalturaRequest<any>[], chunk: boolean): Observable<{}> {
    let maxRequestsPerMultiRequest = requests.length;
    if (chunk) {
      maxRequestsPerMultiRequest = environment.modules.contentModeration.bulkActionsLimit;
    }

    let multiRequests: Observable<KalturaMultiResponse>[] = [];
    let mr: KalturaMultiRequest = new KalturaMultiRequest();

    let counter = 0;
    for (let i = 0; i < requests.length; i++) {
      if (counter === maxRequestsPerMultiRequest) {
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
        let hasFailure = [...responses[0]].filter(function (response) {
          return response.error
        }).length > 0;
        if (hasFailure) {
          throw new Error('error');
        } else {
          return {};
        }
      });
  }

  rejectEntry(entryIds: string[]): Observable<void> {
    return Observable.create(observer => {
      let subscription: ISubscription,
        requests: BaseEntryRejectAction[] = [];
      if (entryIds && entryIds.length) {
        entryIds.forEach(entryId => requests.push(new BaseEntryRejectAction({ entryId: entryId })));
        subscription = this._transmit(requests, true).subscribe(
          () => {
            observer.next(undefined);
            observer.complete();
          },
          error => {
            observer.error(new Error(error && error.message ? error.message : typeof error === 'string' ? error : this._appLocalization.get('applications.content.moderation.errorConnecting')));
          });
      } else {
        observer.error(new Error('missing entryIds argument'));
      }
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      }
    });
  }

  ngOnDestroy() {
  }
}

