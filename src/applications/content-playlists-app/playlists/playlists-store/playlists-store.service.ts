import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { KalturaClient } from 'kaltura-ngx-client';
import { PlaylistListAction } from 'kaltura-ngx-client/api/types/PlaylistListAction';
import { KalturaPlaylistFilter } from 'kaltura-ngx-client/api/types/KalturaPlaylistFilter';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { KalturaDetachedResponseProfile } from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import { KalturaResponseProfileType } from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';
import { PlaylistDeleteAction } from 'kaltura-ngx-client/api/types/PlaylistDeleteAction';
import { KalturaPlaylist } from 'kaltura-ngx-client/api/types/KalturaPlaylist';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { DatesRangeAdapter, DatesRangeType } from '@kaltura-ng/mc-shared/filters/filter-types/dates-range-type';
import { FiltersStoreBase, TypeAdaptersMapping } from '@kaltura-ng/mc-shared/filters/filters-store-base';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KalturaBaseEntryListResponse } from 'kaltura-ngx-client/api/types/KalturaBaseEntryListResponse';
import { KalturaSearchOperatorType } from 'kaltura-ngx-client/api/types/KalturaSearchOperatorType';
import { KalturaSearchOperator } from 'kaltura-ngx-client/api/types/KalturaSearchOperator';
import { StringTypeAdapter } from '@kaltura-ng/mc-shared/filters/filter-types/string-type';
import { NumberTypeAdapter } from '@kaltura-ng/mc-shared/filters/filter-types/number-type';
import { KalturaUtils } from '@kaltura-ng/kaltura-common';
import { ContentPlaylistsMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { globalConfig } from 'config/global';

export enum SortDirection {
  Desc = -1,
  Asc = 1
}

export interface PlaylistsFilters {
  pageSize: number,
  pageIndex: number,
  freeText: string,
  sortBy: string,
  sortDirection: number,
  createdAt: DatesRangeType
}

const localStoragePageSizeKey = 'playlists.list.pageSize';

@Injectable()
export class PlaylistsStore extends FiltersStoreBase<PlaylistsFilters> implements OnDestroy {
  private _playlists = {
    data: new BehaviorSubject<{ items: KalturaPlaylist[], totalCount: number }>({ items: [], totalCount: 0 }),
    state: new BehaviorSubject<{ loading: boolean, errorMessage: string }>({ loading: false, errorMessage: null })
  };
  private _isReady = false;
  private _querySubscription: ISubscription;

  public readonly playlists = {
    data$: this._playlists.data.asObservable(),
    state$: this._playlists.state.asObservable(),
    data: () => this._playlists.data.value
  };

  constructor(private _kalturaServerClient: KalturaClient,
              private _browserService: BrowserService,
              contentPlaylistsMainView: ContentPlaylistsMainViewService,
              _logger: KalturaLogger) {
        super(_logger);
        if (contentPlaylistsMainView.isAvailable()) {
            this._prepare();
        } else {
            this._browserService.handleUnpermittedAction(true);
        }
  }

  ngOnDestroy() {
    this._playlists.data.complete();
    this._playlists.state.complete();
  }

  private _prepare(): void {

      // NOTICE: do not execute here any logic that should run only once.
      // this function will re-run if preparation failed. execute your logic
      // only after the line where we set isReady to true

    if (!this._isReady) {
      this._isReady = true;

      const defaultPageSize = this._browserService.getFromLocalStorage(localStoragePageSizeKey);
      if (defaultPageSize !== null && (defaultPageSize !== this.cloneFilter('pageSize', null))) {
        this.filter({
          pageSize: defaultPageSize
        });
      }

      this._registerToFilterStoreDataChanges();
      this._executeQuery();
    }
  }

  private _registerToFilterStoreDataChanges(): void {
    this.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(() => {
        this._executeQuery();
      });
  }

  private _executeQuery(): void {

    if (this._querySubscription) {
      this._querySubscription.unsubscribe();
      this._querySubscription = null;
    }

    const pageSize = this.cloneFilter('pageSize', null);
    if (pageSize) {
      this._browserService.setInLocalStorage(localStoragePageSizeKey, pageSize);
    }

    this._playlists.state.next({ loading: true, errorMessage: null });
    this._querySubscription = this._buildQueryRequest()
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this._querySubscription = null;

          this._playlists.state.next({ loading: false, errorMessage: null });

          this._playlists.data.next({
            items: <any[]>response.objects,
            totalCount: <number>response.totalCount
          });
        },
        error => {
          this._querySubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._playlists.state.next({ loading: false, errorMessage });
        });
  }

  private _buildQueryRequest(): Observable<KalturaBaseEntryListResponse> {
    try {

      // create request items
      const filter = new KalturaPlaylistFilter({});
      let responseProfile: KalturaDetachedResponseProfile = null;
      let pager: KalturaFilterPager = null;

      const advancedSearch = filter.advancedSearch = new KalturaSearchOperator({});
      advancedSearch.type = KalturaSearchOperatorType.searchAnd;

      const data: PlaylistsFilters = this._getFiltersAsReadonly();

      // filter 'createdAt'
      if (data.createdAt) {
        if (data.createdAt.fromDate) {
          filter.createdAtGreaterThanOrEqual = KalturaUtils.getStartDateValue(data.createdAt.fromDate);
        }

        if (data.createdAt.toDate) {
          filter.createdAtLessThanOrEqual = KalturaUtils.getEndDateValue(data.createdAt.toDate);
        }
      }

      // update desired fields of entries
        responseProfile = new KalturaDetachedResponseProfile({
          type: KalturaResponseProfileType.includeFields,
          fields: 'id,name,createdAt,playlistType,status'
        });

      // update the sort by args
      if (data.sortBy) {
        filter.orderBy = `${data.sortDirection === SortDirection.Desc ? '-' : '+'}${data.sortBy}`;
      }

      // filter 'freeText'
      if (data.freeText) {
        filter.freeText = data.freeText;
      }

      // update pagination args
      if (data.pageIndex || data.pageSize) {
        pager = new KalturaFilterPager(
          {
            pageSize: data.pageSize,
            pageIndex: data.pageIndex + 1
          }
        );
      }

      // build the request
      return <any>this._kalturaServerClient.request(
        new PlaylistListAction({ filter, pager}).setRequestOptions({
            responseProfile
        })
      );
    } catch (err) {
      return Observable.throw(err);
    }
  }

    protected _preFiltersReset(updates: Partial<PlaylistsFilters>): Partial<PlaylistsFilters> {
        delete updates.sortBy;
        delete updates.sortDirection;
        return updates;
    }

    protected _preFilter(updates: Partial<PlaylistsFilters>): Partial<PlaylistsFilters> {
    if (typeof updates.pageIndex === 'undefined') {
      // reset page index to first page everytime filtering the list by any filter that is not page index
      updates.pageIndex = 0;
    }

    return updates;
  }

  protected _createDefaultFiltersValue(): PlaylistsFilters {
    const pageSize = this._browserService.getFromLocalStorage(localStoragePageSizeKey) || globalConfig.client.views.tables.defaultPageSize;
    return {
      pageSize: pageSize,
      pageIndex: 0,
      freeText: '',
      sortBy: 'createdAt',
      sortDirection: SortDirection.Desc,
      createdAt: { fromDate: null, toDate: null }
    };
  }

  protected _getTypeAdaptersMapping(): TypeAdaptersMapping<PlaylistsFilters> {
    return {
      pageSize: new NumberTypeAdapter(),
      pageIndex: new NumberTypeAdapter(),
      sortBy: new StringTypeAdapter(),
      sortDirection: new NumberTypeAdapter(),
      freeText: new StringTypeAdapter(),
      createdAt: new DatesRangeAdapter(),
    };
  }

  public reload(): void {
    if (this._playlists.state.getValue().loading) {
      return;
    }

    if (this._isReady) {
      this._executeQuery();
    } else {
      this._prepare();
    }
  }

  public deletePlaylist(id: string): Observable<void> {
    return this._kalturaServerClient
      .request(new PlaylistDeleteAction({ id }))
      .map(() => {
      });
  }
}

