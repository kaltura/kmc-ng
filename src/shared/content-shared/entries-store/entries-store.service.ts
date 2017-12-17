import { Host, Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { MetadataProfileCreateModes, MetadataProfileStore, MetadataProfileTypes } from 'app-shared/kmc-shared';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/subscribeOn';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

import { KalturaBaseEntryListResponse } from 'kaltura-ngx-client/api/types/KalturaBaseEntryListResponse';
import { BaseEntryDeleteAction } from 'kaltura-ngx-client/api/types/BaseEntryDeleteAction';
import { KalturaDetachedResponseProfile } from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { KalturaMediaEntryFilter } from 'kaltura-ngx-client/api/types/KalturaMediaEntryFilter';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaMetadataSearchItem } from 'kaltura-ngx-client/api/types/KalturaMetadataSearchItem';
import { KalturaResponseProfileType } from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';
import { KalturaSearchOperator } from 'kaltura-ngx-client/api/types/KalturaSearchOperator';
import { KalturaSearchOperatorType } from 'kaltura-ngx-client/api/types/KalturaSearchOperatorType';
import { BaseEntryListAction } from 'kaltura-ngx-client/api/types/BaseEntryListAction';

import { KalturaClient } from 'kaltura-ngx-client';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { KalturaLiveStreamAdminEntry } from 'kaltura-ngx-client/api/types/KalturaLiveStreamAdminEntry';
import { KalturaLiveStreamEntry } from 'kaltura-ngx-client/api/types/KalturaLiveStreamEntry';
import { KalturaExternalMediaEntry } from 'kaltura-ngx-client/api/types/KalturaExternalMediaEntry';

import { KalturaLogger } from '@kaltura-ng/kaltura-log';
import { FiltersStoreBase, TypeAdaptersMapping } from './filters-store-base';
import { StringTypeAdapter } from './filter-types/string-type';
import { DatesRangeAdapter, DatesRangeType } from './filter-types/dates-range-type';
import { ListAdapter, ListType } from './filter-types/list-type';
import { KalturaUtils } from '@kaltura-ng/kaltura-common';
import {
    GroupedListAdapter,
    GroupedListType
} from 'app-shared/content-shared/entries-store/filter-types/grouped-list-type';
import { NumberTypeAdapter } from 'app-shared/content-shared/entries-store/filter-types/number-type';


export type UpdateStatus = {
  loading: boolean;
  errorMessage: string;
};

export interface Entries {
  items: KalturaMediaEntry[],
  totalCount: number
}

export enum SortDirection {
    Desc,
    Asc
}


export interface EntriesFilters {
    freetext: string,
    pageSize: number,
    pageIndex: number,
    sortBy: string,
    sortDirection: number,
    fields: string,
    createdAt: DatesRangeType,
    scheduledAt: DatesRangeType,
    mediaTypes: ListType,
    timeScheduling: ListType,
    ingestionStatuses: ListType,
    durations: ListType,
    originalClippedEntries: ListType,
    moderationStatuses: ListType,
    replacementStatuses: ListType,
    accessControlProfiles: ListType,
    flavors: ListType,
    distributions: ListType,
    customMetadata: GroupedListType
}


@Injectable()
export class EntriesStore extends FiltersStoreBase<EntriesFilters> implements OnDestroy {
  private _entries = new BehaviorSubject({ items: [], totalCount: 0 });
  private _state = new BehaviorSubject<UpdateStatus>({ loading: false, errorMessage: null });
  private _paginationCacheToken = 'default';
  private _isReady = false;
    private _metadataProfiles: number[];
    private _querySubscription: ISubscription;

  // TODO sakal combine
  public entries$ = this._entries.asObservable();
  public state$ = this._state.asObservable();

  public set paginationCacheToken(token: string) {
    this._paginationCacheToken = typeof token === 'string' && token !== '' ? token : 'default';
  }

  constructor(private kalturaServerClient: KalturaClient,
              private browserService: BrowserService,
              private metadataProfileService: MetadataProfileStore,
              _logger: KalturaLogger) {
      super(_logger);
      this._prepare();
  }

    private _prepare(): void {
        if (!this._isReady) {
            this._state.next({ loading : true, errorMessage : null });
            this.metadataProfileService.get(
                {
                    type: MetadataProfileTypes.Entry,
                    ignoredCreateMode: MetadataProfileCreateModes.App
                })
                .cancelOnDestroy(this)
                .first()
                .monitor('entries store: get metadata profiles')
                .subscribe(
                    metadataProfiles => {
                      this._isReady = true;
                      this._metadataProfiles = metadataProfiles.items.map(metadataProfile => metadataProfile.id);

                        const defaultPageSize = this.browserService.getFromLocalStorage(this._getPaginationCacheKey());
                        if (defaultPageSize !== null) {
                            this.filter({
                                pageSize: defaultPageSize
                            });
                        }

                        this._registerToFilterStoreDataChanges();

                        this._executeQuery();

                        this._state.next({ loading : false, errorMessage : null });
                    },
                    (error) =>
                    {
                        this._state.next({ loading : false, errorMessage : error.message });
                    }
                );
        }
    }

    private _registerToFilterStoreDataChanges(): void {
        this.dataChanges$
            .cancelOnDestroy(this)
            .subscribe(filters => {
                this._executeQuery();
            });

    }


    private _getPaginationCacheKey(): string {
    return `entries.${this._paginationCacheToken}.list.pageSize`;
  }

  ngOnDestroy() {
    this._state.complete();
    this._entries.complete();
  }

  public get entries(): KalturaMediaEntry[] {
    return this._entries.getValue().items;
  }

  public reload(): void {
      if (this._state.getValue().loading)
      {
          return;
      }

      if (this._isReady) {
          this._executeQuery();
      }else
      {
          this._prepare();
      }
  }

  private _executeQuery(): void {

      if (this._querySubscription)
      {
          this._querySubscription.unsubscribe();
          this._querySubscription = null;
      }

      const pageSize = this.cloneFilter('pageSize',null);
      if (pageSize) {
          this.browserService.setInLocalStorage(this._getPaginationCacheKey(), pageSize);
      }

      this._state.next({ loading : true, errorMessage : null });
      this._querySubscription = this.buildQueryRequest()
          .cancelOnDestroy(this)
            .subscribe(
              response => {
                  this._querySubscription = null;

                  this._state.next({ loading: false, errorMessage: null });

                  this._entries.next({
                      items: <any[]>response.objects,
                      totalCount: <number>response.totalCount
                  });
              },
              error => {
                  this._querySubscription = null;
                  const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
                  this._state.next({ loading: false, errorMessage });
              });


  }

  private buildQueryRequest(): Observable<KalturaBaseEntryListResponse> {
    try {
      const filter: KalturaMediaEntryFilter = new KalturaMediaEntryFilter({});
      let responseProfile: KalturaDetachedResponseProfile = null;
      let pagination: KalturaFilterPager = null;

      const advancedSearch = filter.advancedSearch = new KalturaSearchOperator({});
      advancedSearch.type = KalturaSearchOperatorType.searchAnd;

        const data: EntriesFilters = this._getData();

        this._logger.info('assign filters to request', { filters: data});

        if (data.freetext) {
            filter.freeText = data.freetext;
        }


        if (data.createdAt ) {
            if (data.createdAt.fromDate) {
                filter.createdAtGreaterThanOrEqual = KalturaUtils.getStartDateValue(data.createdAt.fromDate);
            }

            if (data.createdAt.toDate) {
                filter.createdAtLessThanOrEqual = KalturaUtils.getEndDateValue(data.createdAt.toDate);
            }
        }

        const mediaTypeFilters = data.mediaTypes.map(item => item.value).join(',');

        if (mediaTypeFilters) {
            filter.mediaTypeIn = mediaTypeFilters;
        }

        const ingestionStatuses = data.ingestionStatuses.map(item => item.value).join(',');

        if (ingestionStatuses) {
            filter.statusIn = ingestionStatuses;
        }

        data.timeScheduling.forEach(item => {
            switch (item.value) {
                case 'past':
                    if (filter.endDateLessThanOrEqual === undefined || filter.endDateLessThanOrEqual < (new Date())) {
                        filter.endDateLessThanOrEqual = (new Date());
                    }
                    break;
                case 'live':
                    if (filter.startDateLessThanOrEqualOrNull === undefined || filter.startDateLessThanOrEqualOrNull > (new Date())) {
                        filter.startDateLessThanOrEqualOrNull = (new Date());
                    }
                    if (filter.endDateGreaterThanOrEqualOrNull === undefined || filter.endDateGreaterThanOrEqualOrNull < (new Date())) {
                        filter.endDateGreaterThanOrEqualOrNull = (new Date());
                    }
                    break;
                case 'future':
                    if (filter.startDateGreaterThanOrEqual === undefined || filter.startDateGreaterThanOrEqual > (new Date())) {
                        filter.startDateGreaterThanOrEqual = (new Date());
                    }
                    break;
                case 'scheduled':
                    if (data.scheduledAt.fromDate) {
                        if (filter.startDateGreaterThanOrEqual === undefined
                            || filter.startDateGreaterThanOrEqual > (KalturaUtils.getStartDateValue(data.scheduledAt.fromDate))
                        ) {
                            filter.startDateGreaterThanOrEqual = (KalturaUtils.getStartDateValue(data.scheduledAt.fromDate));
                        }
                    }

                    if (data.scheduledAt.toDate) {
                        if (filter.endDateLessThanOrEqual === undefined
                            || filter.endDateLessThanOrEqual < (KalturaUtils.getEndDateValue(data.scheduledAt.toDate))
                        ) {
                            filter.endDateLessThanOrEqual = (KalturaUtils.getEndDateValue(data.scheduledAt.toDate));
                        }
                    }

                    break;
                default:
                    break
            }
        });

      // handle default args of metadata profiles (we must send all metadata profiles that should take part of the freetext searching
      if (this._metadataProfiles && this._metadataProfiles.length > 0) {
        const missingMetadataProfiles = [...this._metadataProfiles]; // create a new array (don't alter the original one)

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
      if (data.sortBy) {
        filter.orderBy = `${data.sortDirection === SortDirection.Desc ? '-' : '+'}${data.sortBy}`;
      }

      // update desired fields of entries
      if (data.fields) {
        responseProfile = new KalturaDetachedResponseProfile({
          type: KalturaResponseProfileType.includeFields,
          fields: data.fields
        });

      }

      // update pagination args
      if (data.pageIndex || data.pageSize) {
        pagination = new KalturaFilterPager(
          {
            pageSize: data.pageSize,
            pageIndex: data.pageIndex + 1
          }
        );
      }

      // build the request
      return <any>this.kalturaServerClient.request(
        new BaseEntryListAction({
          filter,
          pager: pagination,
          responseProfile,
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

    protected _createEmptyStore(): EntriesFilters {
        return {
            freetext: '',
            pageSize: 50,
            pageIndex: 0,
            sortBy: 'createdAt',
            sortDirection: SortDirection.Desc,
            fields: 'id,name,thumbnailUrl,mediaType,plays,createdAt,duration,status,startDate,endDate,moderationStatus,tags,categoriesIds,downloadUrl',
            createdAt: {fromDate: null, toDate: null},
            scheduledAt: {fromDate: null, toDate: null},
            mediaTypes: [],
            timeScheduling: [],
            ingestionStatuses: [],
            durations: [],
            originalClippedEntries: [],
            moderationStatuses: [],
            replacementStatuses: [],
            accessControlProfiles: [],
            flavors: [],
            distributions: [],
            customMetadata : {}
        };
    }

    protected _getTypeAdaptersMapping(): TypeAdaptersMapping<EntriesFilters> {
        return {
            freetext: new StringTypeAdapter(),
            pageSize: new NumberTypeAdapter(),
            pageIndex: new NumberTypeAdapter(),
            sortBy: new StringTypeAdapter(),
            sortDirection: new NumberTypeAdapter(),
            fields: new StringTypeAdapter(),
            createdAt: new DatesRangeAdapter(),
            scheduledAt: new DatesRangeAdapter(),
            mediaTypes: new ListAdapter(),
            timeScheduling: new ListAdapter(),
            ingestionStatuses: new ListAdapter(),
            durations: new ListAdapter(),
            originalClippedEntries: new ListAdapter(),
            moderationStatuses: new ListAdapter(),
            replacementStatuses: new ListAdapter(),
            accessControlProfiles: new ListAdapter(),
            flavors: new ListAdapter(),
            distributions: new ListAdapter(),
            customMetadata: new GroupedListAdapter()
        };
    }
}
