import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { async } from 'rxjs/scheduler/async';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaDetachedResponseProfile } from 'kaltura-typescript-client/types/KalturaDetachedResponseProfile';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { KalturaBulkUploadFilter } from 'kaltura-typescript-client/types/KalturaBulkUploadFilter';
import { KalturaBulkUpload } from 'kaltura-typescript-client/types/KalturaBulkUpload';
import { BulkUploadAbortAction } from 'kaltura-typescript-client/types/BulkUploadAbortAction';
import { FilterItem } from 'app-shared/content-shared/entries-store/filter-item';
import { Subject } from 'rxjs/Subject';
import { QueryRequestArgs } from 'app-shared/content-shared/entries-store/entries-store.service';
import { BulkListAction } from 'kaltura-typescript-client/types/BulkListAction';
import { KalturaResponseProfileType } from 'kaltura-typescript-client/types/KalturaResponseProfileType';
import { KalturaMultiResponse } from 'kaltura-typescript-client';

export enum SortDirection {
  Desc,
  Asc
}

export interface QueryData {
  pageIndex?: number,
  pageSize?: number,
  sortBy?: string,
  sortDirection?: SortDirection,
  fields?: string,
}

export interface FilterArgs {
  filter: KalturaBulkUploadFilter
}

export type FilterTypeConstructor<T extends FilterItem> = { new(...args: Array<any>): T; };

@Injectable()
export class BulkLogStoreService implements OnDestroy {
  private static filterTypeMapping = {};

  private _bulkLogSource = new BehaviorSubject<{ items: Array<KalturaBulkUpload>, totalCount: number }>({
    items: [],
    totalCount: 0
  });
  private _stateSource = new BehaviorSubject<{ loading: boolean, errorMessage: string }>({
    loading: false,
    errorMessage: null
  });
  private _querySource = new Subject<QueryRequestArgs>();
  private _activeFilters = new BehaviorSubject<{ filters: Array<FilterItem> }>({ filters: [] });
  private _activeFiltersMap: { [key: string]: Array<FilterItem> } = {};
  private _queryData: QueryData = {
    pageIndex: 1,
    pageSize: 50,
    sortBy: 'createdAt',
    sortDirection: SortDirection.Desc,
    fields: 'id,fileName,bulkUploadType,bulkUploadObjectType,uploadedBy,uploadedByUserId,uploadedOn,numOfObjects,status,error'
  };
  private _executeQueryStateSubscription: ISubscription;

  public bulkLog$ = this._bulkLogSource.asObservable();
  public state$ = this._stateSource.asObservable();
  public query$ = this._querySource.monitor('queryData update');
  public activeFilters$ = this._activeFilters.asObservable();

  public static getFilterType(filter: any): string {
    const result = filter['filterType'] || filter.constructor['filterType'];

    if (!result) {
      throw new Error('Failed to extract filter type value (do you have a static property named filterType?)');
    }

    return result;
  }

  public static registerFilterType<T extends FilterItem>(filterType: FilterTypeConstructor<T>,
                                                         handler: (items: Array<T>, request: FilterArgs) => void): void {
    BulkLogStoreService.filterTypeMapping[this.getFilterType(filterType)] = handler;
  }

  public get queryData(): QueryData {
    return Object.assign({}, this._queryData);
  }

  constructor(private kalturaServerClient: KalturaClient,
              private browserService: BrowserService,
              public _kalturaServerClient: KalturaClient) {
    const defaultPageSize = this.browserService.getFromLocalStorage('bulkupload.list.pageSize');
    if (defaultPageSize !== null) {
      this._queryData.pageSize = defaultPageSize;
    }
  }

  ngOnDestroy() {
    this._stateSource.complete();
    this._querySource.complete();
    this._bulkLogSource.complete();

    if (this._executeQueryStateSubscription) {
      this._executeQueryStateSubscription.unsubscribe();
    }
  }

  public getFilterType(filter: any): string {
    return BulkLogStoreService.getFilterType(filter);
  }

  public removeFiltersByType(filterType: FilterTypeConstructor<FilterItem>): void {
    const filtersOfType = this._activeFiltersMap[this.getFilterType(filterType)];

    if (filtersOfType) {
      this.removeFilters(...filtersOfType);
    }
  }

  public getFirstFilterByType<T extends FilterItem>(filterType: FilterTypeConstructor<T>): T {
    const filters = <Array<T>>this.getFiltersByType(filterType);
    return filters && filters.length > 0 ? filters[0] : null;
  }

  public getFiltersByType<T extends FilterItem>(filterType: FilterItem | FilterTypeConstructor<T>): Array<T> {
    if (filterType instanceof FilterItem) {
      const filtersOfType = <Array<T>>this._activeFiltersMap[this.getFilterType(filterType)];
      return filtersOfType ? [...filtersOfType] : [];
    }
    if (filterType instanceof Function) {
      const filtersOfType = <Array<T>>this._activeFiltersMap[this.getFilterType(filterType)];
      return filtersOfType ? [...filtersOfType] : [];
    } else {
      return [];
    }
  }

  public clearAllFilters(): void {
    const previousFilters = this._activeFilters.getValue().filters;
    this._activeFilters.next({ filters: [] });
    this._activeFiltersMap = {};
    this._executeQuery({ removedFilters: previousFilters, addedFilters: [] });
  }

  public addFilters(...filters: Array<FilterItem>): void {
    if (filters) {
      const addedFilters = [];
      const activeFilters = this._activeFilters.getValue().filters;

      filters.forEach(filter => {
        const index = activeFilters.indexOf(filter);

        if (index === -1) {
          addedFilters.push(filter);
          this._activeFiltersMap[this.getFilterType(filter)] = this._activeFiltersMap[this.getFilterType(filter)] || [];
          this._activeFiltersMap[this.getFilterType(filter)].push(filter);
        }
      });

      if (addedFilters.length > 0) {
        this._activeFilters.next({ filters: [...activeFilters, ...addedFilters] });
        this._queryData.pageIndex = 1;
        this._executeQuery({ removedFilters: [], addedFilters: addedFilters });
      }
    }
  }

  public removeFilters(...filters: Array<FilterItem>): void {
    if (filters) {
      const removedFilters: Array<FilterItem> = [];
      const activeFilters = this._activeFilters.getValue().filters;
      const modifiedActiveFilters = [...activeFilters];

      filters.forEach(filter => {
        const index = modifiedActiveFilters.indexOf(filter);

        if (index >= 0) {
          removedFilters.push(filter);
          modifiedActiveFilters.splice(index, 1);

          const filterByType = this._activeFiltersMap[this.getFilterType(filter)];
          filterByType.splice(filterByType.indexOf(filter), 1);
        }
      });

      if (removedFilters.length > 0) {
        this._activeFilters.next({ filters: modifiedActiveFilters });

        this._queryData.pageIndex = 1;
        this._executeQuery({ removedFilters: removedFilters, addedFilters: [] });
      }
    }
  }

  private _executeQuery({ addedFilters = [], removedFilters = [] }: { addedFilters: Array<FilterItem>, removedFilters: Array<FilterItem> } = {
    addedFilters: [],
    removedFilters: []
  }): void {
    // cancel previous requests
    if (this._executeQueryStateSubscription) {
      this._executeQueryStateSubscription.unsubscribe();
      this._executeQueryStateSubscription = null;
    }

    this.browserService.setInLocalStorage('bulkupload.list.pageSize', this._queryData.pageSize);

    this._stateSource.next({ loading: true, errorMessage: null });

    const queryArgs: QueryRequestArgs = Object.assign({},
      {
        addedFilters,
        removedFilters,
        filters: this._activeFilters.getValue().filters,
        data: this._queryData
      });

    this._querySource.next(queryArgs);

    // execute the request
    this._executeQueryStateSubscription = this._buildQueryRequest(queryArgs)
      .subscribeOn(async) // using async scheduler go allow calling this function multiple times
      // in the same event loop cycle before invoking the logic.
      .monitor('bulkLog store: get bulkLog()', { addedFilters, removedFilters })
      .subscribe(
        response => {
          this._executeQueryStateSubscription = null;

          this._stateSource.next({ loading: false, errorMessage: null });

          this._bulkLogSource.next({
            items: <Array<any>>response.objects,
            totalCount: <number>response.totalCount
          });
        },
        error => {
          this._executeQueryStateSubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._stateSource.next({ loading: false, errorMessage });
        });

  }

  private _buildQueryRequest({ filters: activeFilters, data: queryData }: { filters: Array<FilterItem>, data: QueryData }): Observable<any> {
    try {
      const filter: KalturaBulkUploadFilter = new KalturaBulkUploadFilter({});
      let responseProfile: KalturaDetachedResponseProfile = null;
      let pagination: KalturaFilterPager = null;

      const requestContext: FilterArgs = { filter };

      // build request args by converting filters using registered handlers
      if (activeFilters && activeFilters.length > 0) {

        Object.keys(this._activeFiltersMap).forEach(key => {
          const handler = BulkLogStoreService.filterTypeMapping[key];
          const items = this._activeFiltersMap[key];

          if (handler && items && items.length > 0) {
            handler(items, requestContext);
          }
        });
      }

      // handle default value for media types
      if (!filter.bulkUploadObjectTypeIn) {
        filter.bulkUploadObjectTypeIn = '1,2,3,4';
      }

      // handle default value for statuses
      if (!filter.statusIn) {
        filter.statusIn = '0,1,2,3,4,5,6,7,8,9,10,11,12';
      }

      // update the sort by args
      if (queryData.sortBy) {
        filter.orderBy = `${queryData.sortDirection === SortDirection.Desc ? '-' : '+'}${queryData.sortBy}`;
      }

      // update desired fields of entries
      if (queryData.fields) {
        responseProfile = new KalturaDetachedResponseProfile({
          type: KalturaResponseProfileType.includeFields,
          fields: queryData.fields
        });
      }

      // update pagination args
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
        new BulkListAction({
          bulkUploadFilter: requestContext.filter,
          pager: pagination,
          responseProfile: responseProfile
        })
      )
    } catch (err) {
      return Observable.throw(err);
    }
  }

  public deleteBulkLog(id: number): Observable<KalturaBulkUpload> {
    return this._kalturaServerClient.request(new BulkUploadAbortAction({ id }));
  }

  public deleteBulkLogs(files: Array<KalturaBulkUpload>): Observable<KalturaMultiResponse> {
    return this._kalturaServerClient.multiRequest(files.map(({ id }) => new BulkUploadAbortAction({ id })));
  }

  public reload(query: boolean | Partial<QueryData>): void {
    const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));

    if (forceReload || this._bulkLogSource.getValue().totalCount === 0) {
      if (typeof query === 'object') {
        Object.assign(this._queryData, query);
      }
      this._executeQuery();
    }
  }
}

