import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';
import { KalturaClient } from 'kaltura-ngx-client';
import { BaseEntryDeleteAction } from 'kaltura-ngx-client';

@Injectable()
export class ContentEntriesAppService {
  constructor(private _kalturaServerClient: KalturaClient) {

  }

  public deleteEntry(entryId: string): Observable<void> {
    return Observable.create(observer => {
      let subscription: ISubscription;
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
}
