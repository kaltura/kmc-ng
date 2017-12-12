import { Injectable, OnDestroy } from '@angular/core';
import { MediaListFlagsAction } from 'kaltura-typescript-client/types/MediaListFlagsAction';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { BaseEntryGetAction } from 'kaltura-typescript-client/types/BaseEntryGetAction';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { KalturaModerationFlagListResponse } from 'kaltura-typescript-client/types/KalturaModerationFlagListResponse';
import { Observable } from 'rxjs/Observable';
import { UserNotifyBanAction } from 'kaltura-typescript-client/types/UserNotifyBanAction';
import { KalturaMultiResponse } from "kaltura-typescript-client";

@Injectable()
export class ModerationStore implements OnDestroy {
  private _moderationData = new BehaviorSubject<{ entry: KalturaMediaEntry, flag: KalturaModerationFlagListResponse}>({entry: null, flag: null});
  public moderationData$ = this._moderationData.asObservable();
  public sortBy : string = 'createdAt';

  constructor(private _kalturaServerClient: KalturaClient) {}

  loadEntryModerationDetails(entryId: string): Observable<KalturaMultiResponse> {
    return this._kalturaServerClient.multiRequest([
      new BaseEntryGetAction(
        {
          entryId: entryId,
          acceptedTypes: [KalturaMediaEntry]
        }
      ),
      new MediaListFlagsAction (
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
    return this._kalturaServerClient.request(new UserNotifyBanAction({userId: userId}))
      .catch(() => {
        return Observable.throw(new Error('Unable to ban the Creator'));
      })
  }

  ngOnDestroy() {}
}

