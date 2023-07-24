import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {ISubscription} from 'rxjs/Subscription';
import {
    BaseEntryDeleteAction,
    ESearchSearchEntryAction,
    KalturaClient,
    KalturaESearchCategoryEntryFieldName,
    KalturaESearchCategoryEntryItem,
    KalturaESearchEntryFieldName,
    KalturaESearchEntryItem,
    KalturaESearchEntryOperator,
    KalturaESearchEntryOrderByFieldName,
    KalturaESearchEntryOrderByItem,
    KalturaESearchEntryParams,
    KalturaESearchEntryResponse,
    KalturaESearchItemType,
    KalturaESearchOperatorType,
    KalturaESearchOrderBy,
    KalturaESearchSortOrder,
    KalturaFilterPager,
    KalturaMediaEntry,
    KalturaRoomEntry,
    RoomDeleteAction
} from 'kaltura-ngx-client';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {
    AppLocalization,
    DatesRangeAdapter,
    DatesRangeType,
    FiltersStoreBase,
    ListTypeAdapter,
    NumberTypeAdapter,
    StringTypeAdapter,
    TypeAdaptersMapping
} from '@kaltura-ng/mc-shared';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
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
    data: new BehaviorSubject<{ items: (KalturaRoomEntry | KalturaMediaEntry)[], totalCount: number }>({ items: [], totalCount: 0 }),
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

          const rooms = [];
          if (response.objects && response.objects.length) {
              response.objects.forEach(entry => rooms.push(entry.object));
          }

          this._rooms.data.next({
            items: rooms,
            totalCount: <number>response.totalCount
          });
        },
        error => {
          this._querySubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._rooms.state.next({ loading: false, errorMessage });
        });
  }

    private _buildQueryRequest(): Observable<KalturaESearchEntryResponse> {
      const filterData: RoomsFilters = this._getFiltersAsReadonly();

      const getEntryType = new KalturaESearchEntryOperator({
          operator: KalturaESearchOperatorType.orOp,
          searchItems: [
              new KalturaESearchEntryItem({
                  itemType: KalturaESearchItemType.exactMatch,
                  fieldName: KalturaESearchEntryFieldName.entryType,
                  searchTerm: 'room.room'
              }),
              new KalturaESearchEntryItem({
                  itemType: KalturaESearchItemType.exactMatch,
                  fieldName: KalturaESearchEntryFieldName.adminTags,
                  searchTerm: '__meeting_room'
              })
          ]
      })

        const getFreeTextFilter = new KalturaESearchEntryOperator({
          operator: KalturaESearchOperatorType.orOp,
          searchItems: [
              new KalturaESearchEntryItem({
                  itemType: KalturaESearchItemType.partial,
                  fieldName: KalturaESearchEntryFieldName._name,
                  searchTerm: filterData.freeText
              }),
              new KalturaESearchEntryItem({
                  itemType: KalturaESearchItemType.exactMatch,
                  fieldName: KalturaESearchEntryFieldName.id,
                  searchTerm: filterData.freeText
              })
          ]
      })

      const categoriesSearchItems = [];
      if (filterData.categories && filterData.categories.length) {
          filterData.categories.forEach(categoryId => {
              categoriesSearchItems.push(
                  new KalturaESearchCategoryEntryItem({
                      itemType: KalturaESearchItemType.exactMatch,
                      fieldName: KalturaESearchCategoryEntryFieldName.id,
                      searchTerm: categoryId.toString()
                  })
              );
              if (filterData.categoriesMode === CategoriesModes.SelfAndChildren) {
                  categoriesSearchItems.push(
                      new KalturaESearchCategoryEntryItem({
                          itemType: KalturaESearchItemType.exactMatch,
                          fieldName: KalturaESearchCategoryEntryFieldName.ancestorId,
                          searchTerm: categoryId.toString()
                      })
                  );
              }
          })
      }

      const getCategoriesFilter = new KalturaESearchEntryOperator({
        operator: KalturaESearchOperatorType.orOp,
        searchItems: categoriesSearchItems
      })

      const searchItems = [getEntryType];
      if (filterData.freeText) {
          searchItems.push(getFreeTextFilter);
      }
      if (filterData.categories && filterData.categories.length) {
          searchItems.push(getCategoriesFilter);
      }

        return this._kalturaServerClient.request(new ESearchSearchEntryAction({
            searchParams: new KalturaESearchEntryParams({
                objectStatuses: '7',
                orderBy: new KalturaESearchOrderBy({
                    orderItems: [
                        new KalturaESearchEntryOrderByItem({
                            sortOrder: filterData.sortDirection === SortDirection.Desc ? KalturaESearchSortOrder.orderByDesc : KalturaESearchSortOrder.orderByAsc,
                            sortField: filterData.sortBy === 'createdAt' ? KalturaESearchEntryOrderByFieldName.createdAt : KalturaESearchEntryOrderByFieldName._name
                        }),
                    ]
                }),
                searchOperator: new KalturaESearchEntryOperator({
                    operator: KalturaESearchOperatorType.andOp,
                    searchItems
                })

            }),
            pager: new KalturaFilterPager({
                pageIndex : filterData.pageIndex + 1,
                pageSize : filterData.pageSize
            })
        }))

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
    if (typeof updates.categoriesMode !== 'undefined')
    {
        this._browserService.setInLocalStorage('rooms.categoriesTree.selectionMode', updates.categoriesMode);
    }
    return updates;
  }

  protected _createDefaultFiltersValue(): RoomsFilters {
      const savedAutoSelectChildren: CategoriesModes = this._browserService
          .getFromLocalStorage('rooms.categoriesTree.selectionMode');
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

  public deleteRoom(roomId: string, isRoomType: boolean): Observable<void> {
      if (isRoomType) {
          return this._kalturaServerClient
              .request(new RoomDeleteAction({ roomId }))
              .pipe(map(() => {
              }));
      } else {
          return this._kalturaServerClient
              .request(new BaseEntryDeleteAction({ entryId: roomId }))
              .pipe(map(() => {
              }));
      }

  }
}

