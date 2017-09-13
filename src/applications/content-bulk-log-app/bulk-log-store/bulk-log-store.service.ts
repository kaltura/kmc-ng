import { Injectable, OnDestroy } from '@angular/core';
import { KalturaUtils } from 'kaltura-typescript-client/utils/kaltura-utils';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { Scheduler } from 'rxjs';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaPlaylistListResponse } from 'kaltura-typescript-client/types/KalturaPlaylistListResponse';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaDetachedResponseProfile } from 'kaltura-typescript-client/types/KalturaDetachedResponseProfile';
import { KalturaResponseProfileType } from 'kaltura-typescript-client/types/KalturaResponseProfileType';
import { PlaylistDeleteAction } from 'kaltura-typescript-client/types/PlaylistDeleteAction';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { KalturaBulkUploadFilter } from 'kaltura-typescript-client/types/KalturaBulkUploadFilter';
import { BulkUploadListAction } from 'kaltura-typescript-client/types/BulkUploadListAction';
import { KalturaBulkUpload } from 'kaltura-typescript-client/types/KalturaBulkUpload';

export enum SortDirection {
  Desc,
  Asc
}

export interface QueryData {
  pageIndex: number,
  pageSize: number,
  sortBy: string,
  sortDirection: SortDirection,
  freeText: string,
  uploadedBefore: Date,
  uploadedAfter: Date
}

@Injectable()
export class BulkLogStoreService implements OnDestroy {
  private _bulkLogSource = new BehaviorSubject<{ items: Array<KalturaBulkUpload>, totalCount: number }>({
    items: [],
    totalCount: 0
  });
  private _stateSource = new BehaviorSubject<{ loading: boolean, errorMessage: string }>({
    loading: false,
    errorMessage: null
  });
  private _querySource = new BehaviorSubject<QueryData>({
    pageIndex: 1,
    pageSize: 50,
    sortBy: 'createdAt',
    sortDirection: SortDirection.Desc,
    freeText: '',
    uploadedBefore: null,
    uploadedAfter: null
  });
  private requestSubscription: ISubscription = null;

  public bulkLog$ = this._bulkLogSource.asObservable();
  public state$ = this._stateSource.asObservable();
  public query$ = this._querySource.monitor('queryData update');

  constructor(private kalturaServerClient: KalturaClient,
              private browserService: BrowserService,
              public _kalturaServerClient: KalturaClient) {
    const defaultPageSize = this.browserService.getFromLocalStorage('playlists.list.pageSize');
    if (defaultPageSize !== null) {
      this._updateQueryData({
        pageSize: defaultPageSize
      });
    }
  }

  private _updateQueryData(partialData: Partial<QueryData>): void {
    const newQueryData = Object.assign({}, this._querySource.getValue(), partialData);
    this._querySource.next(newQueryData);

    if (partialData.pageSize) {
      this.browserService.setInLocalStorage('playlists.list.pageSize', partialData.pageSize);
    }
  }

  public get bulkLog(): Array<KalturaBulkUpload> {
    return this._bulkLogSource.getValue().items;
  }

  ngOnDestroy() {
    this._stateSource.complete();
    this._querySource.complete();
    this._bulkLogSource.complete();

    if (this.requestSubscription) {
      this.requestSubscription.unsubscribe();
    }
  }

  private _executeQuery() {
    // cancel previous requests
    if (this.requestSubscription) {
      this.requestSubscription.unsubscribe();
      this.requestSubscription = null;
    }

    this._stateSource.next({ loading: true, errorMessage: null });

    // execute the request
    this.requestSubscription = this._buildQueryRequest(this._querySource.getValue())
      // using async scheduler go allow calling this function multiple times in the same event loop cycle before invoking the logic.
      .subscribeOn(Scheduler.async)
      .monitor('bulkLog store: get bulkLog()')
      .subscribe(
        response => {
          this.requestSubscription = null;

          this._stateSource.next({ loading: false, errorMessage: null });

          this._bulkLogSource.next({
            items: <any[]>response.objects,
            totalCount: <number>response.totalCount
          });
        },
        error => {
          this.requestSubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._stateSource.next({ loading: false, errorMessage });
        });

  }

  private _buildQueryRequest(queryData: QueryData): Observable<KalturaPlaylistListResponse> {
    try {
      const filter = new KalturaBulkUploadFilter({});

      if (queryData.uploadedBefore) {
        filter.uploadedOnLessThanOrEqual = KalturaUtils.getEndDateValue(queryData.uploadedBefore);
      }

      if (queryData.uploadedAfter) {
        filter.uploadedOnGreaterThanOrEqual = KalturaUtils.getStartDateValue(queryData.uploadedAfter);
      }

      const responseProfile = new KalturaDetachedResponseProfile({
        type: KalturaResponseProfileType.includeFields,
        fields: 'id,name,createdAt,playlistType'
      });


      // update the sort by args
      if (queryData.sortBy) {
        filter.orderBy = `${queryData.sortDirection === SortDirection.Desc ? '-' : '+'}${queryData.sortBy}`;
      }

      // update pagination args
      let pagination: KalturaFilterPager = null;

      if (queryData.pageIndex || queryData.pageSize) {
        pagination = new KalturaFilterPager(
          {
            pageSize: queryData.pageSize,
            pageIndex: queryData.pageIndex
          }
        );
      }

      // build the request
      return <any>this.kalturaServerClient.request(
        new BulkUploadListAction({ pager: pagination })
      );
    } catch (err) {
      return Observable.throw(err);
    }
  }

  public deletePlaylist(id: string) {
    return Observable.create(observer => {
      let subscription: ISubscription;
      subscription = this._kalturaServerClient.request(new PlaylistDeleteAction({ id })).subscribe(
        () => {
          observer.next();
          observer.complete();
        },
        error => {
          observer.error(error);
        }
      );
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      }
    });
  }

  public reload(query: boolean | Partial<QueryData>): void {
    const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));

    if (forceReload || this._bulkLogSource.getValue().totalCount === 0) {
      if (typeof query === 'object') {
        this._updateQueryData(query);
      }
      this._executeQuery();
    }
  }
}

