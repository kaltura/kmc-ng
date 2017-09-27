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
import { BaseEntryListAction } from 'kaltura-typescript-client/types/BaseEntryListAction';
import { KalturaBaseEntryFilter } from 'kaltura-typescript-client/types/KalturaBaseEntryFilter';
import { KalturaBaseEntry } from "kaltura-typescript-client/types/KalturaBaseEntry";

@Injectable()
export class ModerationStore implements OnDestroy {
  private _moderationEntries = new BehaviorSubject<{items: KalturaBaseEntry[], totalCount: number}>({items: [], totalCount: 0});
  private _moderationData = new BehaviorSubject<{ entry: KalturaMediaEntry, flag: KalturaModerationFlagListResponse}>({entry: null, flag: null});
  private _moderationState = new BehaviorSubject<{ isBusy: boolean, error?: { message: string }}>({isBusy: false});
  public moderationEntries$ = this._moderationEntries.asObservable();
  public moderationData$ = this._moderationData.asObservable();
  public moderationState$ = this._moderationState.asObservable();
  public sortAsc : boolean = false;
  public sortBy : string = 'createdAt';

  constructor(
    private _kalturaServerClient: KalturaClient,
    private _appLocalization: AppLocalization
  ) {}

  loadEntriesList() : void {
    this._kalturaServerClient.request(
      new BaseEntryListAction (
        {
          filter: new KalturaBaseEntryFilter(
            {
              orderBy : `${this.sortAsc ? '+' : '-'}${this.sortBy}`,
              moderationStatusIn: "5,1"
            }
          ),
          pager: new KalturaFilterPager({
            pageSize: 50,
            pageIndex: 1
          })
        }
      )
    )
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this._moderationEntries.next({
            items: response.objects,
            totalCount: response.totalCount
          })
        },
        error => {
          this._moderationState.next({
            isBusy: true,
            error: {message: this._appLocalization.get('applications.content.moderation.errorConnecting')}
          });
        }
      );
  }

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
    return Observable.create(observer => {
      this._kalturaServerClient.request(
        new UserNotifyBanAction(
          {
            userId: userId
          }
        )
      )
        .cancelOnDestroy(this)
        .subscribe(
          () => {
            observer.next();
            observer.complete();
          },
          error => {
            observer.error(new Error(this._appLocalization.get('applications.content.moderation.errorOccured')));
          }
        );
    });
  }

  ngOnDestroy() {}
}

