import { Injectable } from '@angular/core';
import { Observable, Unsubscribable } from 'rxjs';
import { KalturaClient, BaseEntryDeleteAction } from 'kaltura-ngx-client';
import { XInternalXAddBulkDownloadAction } from './entries/bulk-actions/services/XInternalXAddBulkDownloadAction';
import { map } from 'rxjs/operators';

@Injectable()
export class ContentEntriesAppService {
  constructor(private _kalturaServerClient: KalturaClient) {

  }

  public deleteEntry(entryId: string): Observable<void> {
    return Observable.create(observer => {
      let subscription: Unsubscribable;
      if (entryId && entryId.length) {
        subscription = this._kalturaServerClient.request(new BaseEntryDeleteAction({ entryId: entryId })).subscribe(
          () => {
            observer.next();
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
      } else {
        observer.error(new Error('missing entryId argument'));
      }
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      }
    });
  }

  public downloadEntry(entryIds: string, flavorParamsId: string): Observable<string> {
      return this._kalturaServerClient
          .request(new XInternalXAddBulkDownloadAction({ entryIds, flavorParamsId }))
          .pipe(map(email => ({ email })));
  }
}
