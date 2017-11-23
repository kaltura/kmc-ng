import { Injectable, OnDestroy } from '@angular/core';
import { MediaListFlagsAction } from 'kaltura-typescript-client/types/MediaListFlagsAction';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { BaseEntryGetAction } from 'kaltura-typescript-client/types/BaseEntryGetAction';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { KalturaModerationFlagListResponse } from 'kaltura-typescript-client/types/KalturaModerationFlagListResponse';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Observable } from 'rxjs/Observable';
import { UserNotifyBanAction } from 'kaltura-typescript-client/types/UserNotifyBanAction';

@Injectable()
export class ModerationStore implements OnDestroy {
  private _moderationData = new BehaviorSubject<{ entry: KalturaMediaEntry, flag: KalturaModerationFlagListResponse}>({entry: null, flag: null});
  private _moderationState = new BehaviorSubject<{ isBusy: boolean, error?: { message: string }}>({isBusy: false});
  public moderationData$ = this._moderationData.asObservable();
  public moderationState$ = this._moderationState.asObservable();
  public sortBy : string = 'createdAt';

  constructor(
    private _kalturaServerClient: KalturaClient,
    private _appLocalization: AppLocalization
  ) {}

  loadEntryModerationDetails(entryId: string) : void {
    this._moderationState.next({ isBusy: true });
    this._moderationData.next({entry: null, flag: null});
    this._kalturaServerClient.multiRequest([
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
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this._moderationData.next({
            entry: response[0].result,
            flag: response[1].result
          });
          this._moderationState.next({ isBusy: false });
        },
        error => {
          this._moderationState.next({
            isBusy: false,
            error: {message: this._appLocalization.get('applications.content.moderation.errorConnecting')}
          });
        }
      );
  }

  banCreator(userId: string): Observable<void> {
    return this._kalturaServerClient.request(new UserNotifyBanAction({userId: userId}))
      .catch(error => {
        return Observable.throw(new Error('Unable to ban the Creator'));
      })
  }

  ngOnDestroy() {}
}

