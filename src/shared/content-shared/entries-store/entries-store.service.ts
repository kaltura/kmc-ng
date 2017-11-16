import { Host, Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { async } from 'rxjs/scheduler/async';
import { MetadataProfileCreateModes, MetadataProfileStore, MetadataProfileTypes } from '@kaltura-ng/kaltura-server-utils';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/subscribeOn';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

import { KalturaBaseEntryListResponse } from 'kaltura-typescript-client/types/KalturaBaseEntryListResponse';
import { BaseEntryDeleteAction } from 'kaltura-typescript-client/types/BaseEntryDeleteAction';
import { KalturaDetachedResponseProfile } from 'kaltura-typescript-client/types/KalturaDetachedResponseProfile';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaMediaEntryFilter } from 'kaltura-typescript-client/types/KalturaMediaEntryFilter';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaMetadataSearchItem } from 'kaltura-typescript-client/types/KalturaMetadataSearchItem';
import { KalturaResponseProfileType } from 'kaltura-typescript-client/types/KalturaResponseProfileType';
import { KalturaSearchOperator } from 'kaltura-typescript-client/types/KalturaSearchOperator';
import { KalturaSearchOperatorType } from 'kaltura-typescript-client/types/KalturaSearchOperatorType';
import { BaseEntryListAction } from 'kaltura-typescript-client/types/BaseEntryListAction';

import { KalturaClient } from '@kaltura-ng/kaltura-client';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

import { FilterItem } from './filter-item';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { KalturaLiveStreamAdminEntry } from 'kaltura-typescript-client/types/KalturaLiveStreamAdminEntry';
import { KalturaLiveStreamEntry } from 'kaltura-typescript-client/types/KalturaLiveStreamEntry';
import { KalturaExternalMediaEntry } from 'kaltura-typescript-client/types/KalturaExternalMediaEntry';
import { EntriesFiltersService } from 'app-shared/content-shared/entries-store/entries-filters.service';
import { environment } from 'app-environment';

export type UpdateStatus = {
  loading: boolean;
  errorMessage: string;
};

export interface Entries {
  items: KalturaMediaEntry[],
  totalCount: number
}

export interface QueryData {
  pageIndex?: number,
  pageSize?: number,
  sortBy?: string,
  sortDirection?: SortDirection,
  fields?: string,
  metadataProfiles?: number[]
}


export interface FilterArgs {
  filter: KalturaMediaEntryFilter,
  advancedSearch: KalturaSearchOperator
}

export enum SortDirection {
  Desc,
  Asc
}

export interface QueryRequestArgs {
  filters: FilterItem[];
  addedFilters: FilterItem[];
  removedFilters: FilterItem[];
  data: QueryData;
}

export type FilterTypeConstructor<T extends FilterItem> = { new(...args: any[]): T; };

@Injectable()
export class EntriesStore implements OnDestroy {
  private static filterTypeMapping = {};

  private _activeFilters = new BehaviorSubject<{ filters: FilterItem[] }>({ filters: [] });
  private _entries = new BehaviorSubject({ items: [], totalCount: 0 });
  private _state = new BehaviorSubject<UpdateStatus>({ loading: false, errorMessage: null });
  private _paginationCacheToken = 'default';

  private _queryData: QueryData = {
    pageIndex: 1,
    pageSize: 50,
    sortBy: 'createdAt',
    sortDirection: SortDirection.Desc,
    fields: `
      id,name,thumbnailUrl,mediaType,plays,createdAt,
      duration,status,startDate,endDate,moderationStatus,
      tags,categoriesIds,downloadUrl
    `
  };
  private _querySource = new Subject<QueryRequestArgs>();
  private _activeFiltersMap: { [key: string]: FilterItem[] } = {};
  private _metadataProfilesLoaded = false;
  private executeQueryState: { subscription: ISubscription, deferredRemovedFilters: any[], deferredAddedFilters: any[] } = {
    subscription: null,
    deferredAddedFilters: [],
    deferredRemovedFilters: []
  };

  public activeFilters$ = this._activeFilters.asObservable();
  public entries$ = this._entries.asObservable();
  public state$ = this._state.asObservable();
  public query$ = this._querySource.asObservable();

  public static getFilterType(filter: any): string {
    const result = filter['filterType'] || filter.constructor['filterType'];

    if (!result) {
      throw new Error('Failed to extract filter type value (do you have a static property named filterType?)');
    }

    return result;
  }


  public static registerFilterType<T extends FilterItem>(filterType: FilterTypeConstructor<T>,
                                                         handler: (items: T[], request: FilterArgs) => void): void {
    EntriesStore.filterTypeMapping[this.getFilterType(filterType)] = handler;
  }

  public set paginationCacheToken(token: string) {
    this._paginationCacheToken = typeof token === 'string' && token !== '' ? token : 'default';
  }

  public getFilterType(filter: any): string {
    return EntriesStore.getFilterType(filter);
  }

  constructor(private kalturaServerClient: KalturaClient,
              private browserService: BrowserService,
              @Host() private _entriesFilters : EntriesFiltersService,
              private metadataProfileService: MetadataProfileStore) {
    const defaultPageSize = this.browserService.getFromLocalStorage(this._getPaginationCacheKey());
    if (defaultPageSize !== null) {
      this._queryData.pageSize = defaultPageSize;
    }

    this._getMetadataProfiles();

    this._entriesFilters.filters$
        .cancelOnDestroy(this)
        .subscribe(filters =>
        {
          this._executeQuery();
        });
  }

  private _getPaginationCacheKey(): string {
    return `entries.${this._paginationCacheToken}.list.pageSize`;
  }

  public get queryData(): QueryData {
    return Object.assign({}, this._queryData);
  }

  private _getMetadataProfiles(): Observable<void> {
    if (this._metadataProfilesLoaded) {
      return Observable.of(undefined);
    } else {
      return this.metadataProfileService.get(
        {
          type: MetadataProfileTypes.Entry,
          ignoredCreateMode: MetadataProfileCreateModes.App
        })
        .cancelOnDestroy(this)
        .monitor('entries store: get metadata profiles')
        .do(
          metadataProfiles => {
            this._queryData.metadataProfiles = metadataProfiles.items.map(metadataProfile => metadataProfile.id);
            this._metadataProfilesLoaded = true;
          }
        ).map(() => {
          return undefined;
        });
    }
  }

  ngOnDestroy() {
    if (this.executeQueryState.subscription) {
      this.executeQueryState.subscription.unsubscribe();
      this.executeQueryState.subscription = null;
    }

    this._activeFilters = null;
    this._activeFiltersMap = null;
    this._state.complete();
    this._querySource.complete();
    this._entries.complete();
  }

  public get entries(): KalturaMediaEntry[] {
    return this._entries.getValue().items;
  }

  public reload(force: boolean): void;
  public reload(query: QueryData): void;
  public reload(query: boolean | QueryData): void {
    const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));

    if (forceReload || this._entries.getValue().totalCount === 0) {
      if (typeof query === 'object') {
        Object.assign(this._queryData, query);
      }
      this._executeQuery();
    }
  }


  public removeFiltersByType(filterType: FilterTypeConstructor<FilterItem>): void {
    const filtersOfType = this._activeFiltersMap[this.getFilterType(filterType)];

    if (filtersOfType) {
      this.removeFilters(...filtersOfType);
    }
  }

  public getFirstFilterByType<T extends FilterItem>(filterType: FilterTypeConstructor<T>): T {
    const filters = <T[]>this.getFiltersByType(filterType);
    return filters && filters.length > 0 ? filters[0] : null;
  }

  public getFiltersByType<T extends FilterItem>(filter: FilterItem): T[]
  public getFiltersByType<T extends FilterItem>(filterType: FilterTypeConstructor<T>): T[];
  public getFiltersByType<T extends FilterItem>(filterType: FilterItem | FilterTypeConstructor<T>): T[] {
    if (filterType instanceof FilterItem) {
      const filtersOfType = <T[]>this._activeFiltersMap[this.getFilterType(filterType)];
      return filtersOfType ? [...filtersOfType] : [];
    }
    if (filterType instanceof Function) {
      const filtersOfType = <T[]>this._activeFiltersMap[this.getFilterType(filterType)];
      return filtersOfType ? [...filtersOfType] : [];
    } else {
      return [];
    }
  }

  public clearAllFilters() {
    const previousFilters = this._activeFilters.getValue().filters;
    this._activeFilters.next({ filters: [] });
    this._activeFiltersMap = {};
    this._executeQuery({ removedFilters: previousFilters, addedFilters: [] });
  }


  public addFilters(...filters: FilterItem[]): void {
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

  public removeFilters(...filters: FilterItem[]): void {
    if (filters) {
      const removedFilters: FilterItem[] = [];
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

  private _executeQuery({ addedFilters, removedFilters }: { addedFilters: FilterItem[], removedFilters: FilterItem[] } = {
    addedFilters: [],
    removedFilters: []
  }) {
    // cancel previous requests
    if (this.executeQueryState.subscription) {
      this.executeQueryState.subscription.unsubscribe();
      this.executeQueryState.subscription = null;
    }

    this.executeQueryState.deferredAddedFilters.push(...addedFilters);
    this.executeQueryState.deferredRemovedFilters.push(...removedFilters);

    this.browserService.setInLocalStorage(this._getPaginationCacheKey(), this._queryData.pageSize);

    // execute the request
    this.executeQueryState.subscription = Observable.create(observer => {

      this._state.next({ loading: true, errorMessage: null });

      let requestSubscription = this._getMetadataProfiles()
        .flatMap(
          () => {
            const queryArgs: QueryRequestArgs = Object.assign({},
              {
                filters: this._activeFilters.getValue().filters,
                addedFilters: this.executeQueryState.deferredAddedFilters || [],
                removedFilters: this.executeQueryState.deferredRemovedFilters || [],
                data: this._queryData
              });

            this._querySource.next(queryArgs);

            this.executeQueryState.deferredAddedFilters = [];
            this.executeQueryState.deferredRemovedFilters = [];


            return this.buildQueryRequest(queryArgs)
              .monitor('entries store: transmit request', queryArgs);
          }
        ).subscribe(observer);


      return () => {
        if (requestSubscription) {
          requestSubscription.unsubscribe();
          requestSubscription = null;
        }
      }
    }).subscribeOn(async) // using async scheduler go allow calling this function multiple times
                          // in the same event loop cycle before invoking the logic.
      .monitor('entries store: get entries ()', { addedFilters, removedFilters })
      .subscribe(
        response => {
          this.executeQueryState.subscription = null;

          this._state.next({ loading: false, errorMessage: null });

          this._entries.next({
            items: <any[]>response.objects,
            totalCount: <number>response.totalCount
          });
        },
        error => {
          this.executeQueryState.subscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._state.next({ loading: false, errorMessage });
        });

  }

  private buildQueryRequest(
    { filters: activeFilters, data: queryData }: { filters: FilterItem[], data: QueryData }
  ): Observable<KalturaBaseEntryListResponse> {
    try {
      const filter: KalturaMediaEntryFilter = new KalturaMediaEntryFilter({});
      let responseProfile: KalturaDetachedResponseProfile = null;
      let pagination: KalturaFilterPager = null;

      const advancedSearch = filter.advancedSearch = new KalturaSearchOperator({});
      advancedSearch.type = KalturaSearchOperatorType.searchAnd;

      const requestContext: FilterArgs = {
        filter: filter,
        advancedSearch: advancedSearch
      };

      // build request args by converting filters using registered handlers
      if (activeFilters && activeFilters.length > 0) {

        Object.keys(this._activeFiltersMap).forEach(key => {
          const handler = EntriesStore.filterTypeMapping[key];
          const items = this._activeFiltersMap[key];

          if (handler && items && items.length > 0) {
            handler(items, requestContext);
          }
        });
      }

      this._entriesFilters.assignFiltersToRequest({
          filter: filter,
          advancedSearch: advancedSearch
      });


      // handle default args of metadata profiles (we must send all metadata profiles that should take part of the freetext searching
      if (queryData.metadataProfiles && queryData.metadataProfiles.length > 0) {
        const missingMetadataProfiles = [...queryData.metadataProfiles]; // create a new array (don't alter the original one)

        // find metadataprofiles that are not part of the request query
        (advancedSearch.items || []).forEach(metadataProfileItem => {
          if (metadataProfileItem instanceof KalturaMetadataSearchItem) {
            const indexOfMetadata = missingMetadataProfiles.indexOf((<KalturaMetadataSearchItem>metadataProfileItem).metadataProfileId);
            if (indexOfMetadata >= 0) {
              missingMetadataProfiles.splice(indexOfMetadata, 1);
            }
          }

        });

        // add default values to the missing metadata profiles
        missingMetadataProfiles.forEach((metadataProfileId: number) => {
          const metadataItem: KalturaMetadataSearchItem = new KalturaMetadataSearchItem({
            metadataProfileId: metadataProfileId,
            type: KalturaSearchOperatorType.searchAnd,
            items: []
          });

          advancedSearch.items.push(metadataItem);
        });
      }

      // remove advanced search arg if it is empty
      if (advancedSearch.items && advancedSearch.items.length === 0) {
        delete filter.advancedSearch;
      }

      // handle default value for media types
      if (!filter.mediaTypeIn) {
        filter.mediaTypeIn = '1,2,5,6,201';
      }

      // handle default value for statuses
      if (!filter.statusIn) {
        filter.statusIn = '-1,-2,0,1,2,7,4';
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
        new BaseEntryListAction({
          filter: requestContext.filter,
          pager: pagination,
          responseProfile: responseProfile,
          acceptedTypes: [KalturaLiveStreamAdminEntry, KalturaLiveStreamEntry, KalturaExternalMediaEntry]
        })
      )
    } catch (err) {
      return Observable.throw(err);
    }

  }

  public deleteEntry(entryId: string): Observable<void> {

    return Observable.create(observer => {
      let subscription: ISubscription;
      if (entryId && entryId.length) {
        subscription = this.kalturaServerClient.request(new BaseEntryDeleteAction({ entryId: entryId })).subscribe(
          result => {
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
