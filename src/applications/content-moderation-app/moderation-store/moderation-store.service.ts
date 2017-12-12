import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaModerationFlagListResponse } from 'kaltura-ngx-client/api/types/KalturaModerationFlagListResponse';
import { KalturaClient, KalturaMultiResponse } from 'kaltura-ngx-client';
import { BaseEntryGetAction } from 'kaltura-ngx-client/api/types/BaseEntryGetAction';
import { MediaListFlagsAction } from 'kaltura-ngx-client/api/types/MediaListFlagsAction';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { UserNotifyBanAction } from 'kaltura-ngx-client/api/types/UserNotifyBanAction';

@Injectable()
export class ModerationStore implements OnDestroy {
  private _moderationData = new BehaviorSubject<{ entry: KalturaMediaEntry, flag: KalturaModerationFlagListResponse }>({
    entry: null,
    flag: null
  });
  public moderationData$ = this._moderationData.asObservable();
  public sortBy: string = 'createdAt';

  constructor(private _kalturaServerClient: KalturaClient) {
  }

  loadEntryModerationDetails(entryId: string): Observable<KalturaMultiResponse> {
    return this._kalturaServerClient.multiRequest([
      new BaseEntryGetAction(
        {
          entryId: entryId,
          acceptedTypes: [KalturaMediaEntry]
        }
      ),
      new MediaListFlagsAction(
        {
          entryId: entryId,
          pager: new KalturaFilterPager({
            pageSize: 500,
            pageIndex: 0
          })
        }
      )]
    )
      .map(
        response => {
          this._moderationData.next({
            entry: response[0].result,
            flag: response[1].result
          });
        }
      )
      .catch(() => {
        return Observable.throw(new Error('Unable to load the entry moderation details'));
      })
  }

  banCreator(userId: string): Observable<void> {
    return this._kalturaServerClient.request(new UserNotifyBanAction({ userId: userId }))
      .catch(() => {
        return Observable.throw(new Error('Unable to ban the Creator'));
      })
  }

  ngOnDestroy() {
  }
}

