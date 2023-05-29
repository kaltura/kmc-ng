import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {ISubscription} from 'rxjs/Subscription';
import {
    KalturaBaseEntry,
    KalturaClient,
    KalturaDetachedResponseProfile,
    KalturaFilterPager,
    KalturaEntryStatus,
    KalturaResponseProfileType,
    KalturaRoomEntryFilter,
    KalturaRoomEntryListResponse,
    KalturaRoomType,
    KalturaSearchOperator,
    KalturaSearchOperatorType,
    RoomDeleteAction, RoomListAction, KalturaRoomEntry
} from 'kaltura-ngx-client';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {
    AppLocalization,
    DatesRangeAdapter,
    DatesRangeType,
    FiltersStoreBase, ListTypeAdapter,
    NumberTypeAdapter,
    StringTypeAdapter,
    TypeAdaptersMapping
} from '@kaltura-ng/mc-shared';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {cancelOnDestroy, KalturaUtils} from '@kaltura-ng/kaltura-common';
import {ContentRoomsMainViewService} from 'app-shared/kmc-shared/kmc-views';
import {globalConfig} from 'config/global';
import {map} from 'rxjs/operators';
import {
    CategoriesModeAdapter,
    CategoriesModes,
    CategoriesModeType
} from "app-shared/content-shared/categories/categories-mode-type";


export enum SortDirection {
  Desc = -1,
  Asc = 1
}

export interface RoomsFilters {
  pageSize: number,
  pageIndex: number,
  freeText: string,
  sortBy: string,
  adminTagsMultiLikeOr: string,
  sortDirection: number,
  createdAt: DatesRangeType,
  categories: number[],
  categoriesMode: CategoriesModeType,
}

const localStoragePageSizeKey = 'rooms.list.pageSize';

@Injectable()
export class RoomsStore extends FiltersStoreBase<RoomsFilters> implements OnDestroy {
  private _rooms = {
    data: new BehaviorSubject<{ items: KalturaRoomEntry[], totalCount: number }>({ items: [], totalCount: 0 }),
    state: new BehaviorSubject<{ loading: boolean, errorMessage: string }>({ loading: false, errorMessage: null })
  };
  private _isReady = false;
  private _querySubscription: ISubscription;

  public readonly rooms = {
    data$: this._rooms.data.asObservable(),
    state$: this._rooms.state.asObservable(),
    data: () => this._rooms.data.value
  };

  constructor(private _kalturaServerClient: KalturaClient,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              contentRoomsMainView: ContentRoomsMainViewService,
              _logger: KalturaLogger) {
        super(_logger);
        if (contentRoomsMainView.isAvailable()) {
            this._prepare();
        }
  }

  ngOnDestroy() {
    this._rooms.data.complete();
    this._rooms.state.complete();
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
      .pipe(cancelOnDestroy(this))
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

    this._rooms.state.next({ loading: true, errorMessage: null });
    this._querySubscription = this._buildQueryRequest()
      .pipe(cancelOnDestroy(this))
      .subscribe(
        response => {
          this._querySubscription = null;

          this._rooms.state.next({ loading: false, errorMessage: null });

          this._rooms.data.next({
            items: response.objects,
            totalCount: <number>response.totalCount
          });
        },
        error => {
          this._querySubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._rooms.state.next({ loading: false, errorMessage });
        });
  }

    private _buildQueryRequest(): Observable<KalturaRoomEntryListResponse> {
    try {

      // create request items
      const filter = new KalturaRoomEntryFilter({statusEqual: KalturaEntryStatus.noContent, roomTypeEqual: KalturaRoomType.room});
      let responseProfile: KalturaDetachedResponseProfile = null;
      let pager: KalturaFilterPager = null;

      const advancedSearch = filter.advancedSearch = new KalturaSearchOperator({});
      advancedSearch.type = KalturaSearchOperatorType.searchAnd;

      const data: RoomsFilters = this._getFiltersAsReadonly();

      // filter categories
        if (data.categories && data.categories.length) {
          const categoriesValue = data.categories.join(',');
          if (data.categoriesMode === CategoriesModes.SelfAndChildren) {
              filter.categoryAncestorIdIn = categoriesValue;
          } else {
              filter.categoriesIdsMatchOr = categoriesValue;
          }
      }

      // update desired fields of entries
        responseProfile = new KalturaDetachedResponseProfile({
          type: KalturaResponseProfileType.includeFields,
          fields: 'id,name,createdAt,roomType,status,tags,adminTags'
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

      return this._kalturaServerClient.request(
          new RoomListAction({filter, pager}).setRequestOptions({
              responseProfile
          }));
    } catch (err) {
      return throwError(err);
    }
  }

    protected _preFiltersReset(updates: Partial<RoomsFilters>): Partial<RoomsFilters> {
        delete updates.sortBy;
        delete updates.sortDirection;
        return updates;
    }

    protected _preFilter(updates: Partial<RoomsFilters>): Partial<RoomsFilters> {
    if (typeof updates.pageIndex === 'undefined') {
      // reset page index to first page everytime filtering the list by any filter that is not page index
      updates.pageIndex = 0;
    }

    return updates;
  }

  protected _createDefaultFiltersValue(): RoomsFilters {
      const savedAutoSelectChildren: CategoriesModes = this._browserService
          .getFromLocalStorage('contentShared.categoriesTree.selectionMode');
      const categoriesMode = typeof savedAutoSelectChildren === 'number'
          ? savedAutoSelectChildren
          : CategoriesModes.SelfAndChildren;

    const pageSize = this._browserService.getFromLocalStorage(localStoragePageSizeKey) || globalConfig.client.views.tables.defaultPageSize;
    return {
      pageSize: pageSize,
      pageIndex: 0,
      freeText: '',
      adminTagsMultiLikeOr: '',
      sortBy: 'createdAt',
      sortDirection: SortDirection.Desc,
      createdAt: { fromDate: null, toDate: null },
      categories: [],
      categoriesMode
    };
  }

  protected _getTypeAdaptersMapping(): TypeAdaptersMapping<RoomsFilters> {
    return {
      pageSize: new NumberTypeAdapter(),
      pageIndex: new NumberTypeAdapter(),
      sortBy: new StringTypeAdapter(),
      sortDirection: new NumberTypeAdapter(),
      freeText: new StringTypeAdapter(),
      adminTagsMultiLikeOr: new StringTypeAdapter(),
      createdAt: new DatesRangeAdapter(),
      categories: new ListTypeAdapter<number>(),
      categoriesMode: new CategoriesModeAdapter()
    };
  }

  public reload(): void {
    if (this._rooms.state.getValue().loading) {
      return;
    }

    if (this._isReady) {
      this._executeQuery();
    } else {
      this._prepare();
    }
  }

  public deleteRoom(roomId: string): Observable<void> {
    return this._kalturaServerClient
      .request(new RoomDeleteAction({ roomId }))
      .pipe(map(() => {
      }));
  }
}

