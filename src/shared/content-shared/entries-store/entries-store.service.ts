import { Inject, Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { MetadataProfileCreateModes, MetadataProfileStore, MetadataProfileTypes } from 'app-shared/kmc-shared';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/subscribeOn';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import { BaseEntryDeleteAction } from 'kaltura-ngx-client/api/types/BaseEntryDeleteAction';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';

import { KalturaClient } from 'kaltura-ngx-client';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';

import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import {
  DatesRangeAdapter, DatesRangeType, FiltersStoreBase, GroupedListAdapter, GroupedListType, ListAdapter, ListType, NumberTypeAdapter,
  StringTypeAdapter, TypeAdaptersMapping
} from '@kaltura-ng/mc-shared/filters';
import { KalturaBaseEntry } from 'kaltura-ngx-client/api/types/KalturaBaseEntry';
import { EntriesDataProviderToken } from 'app-shared/content-shared/entries-store/defaultEntriesDataProvider';

export enum SortDirection {
    Desc,
    Asc
}

export interface EntriesDataProvider {
  executeQuery(filters: EntriesFilters, metadataProfiles): Observable<{ entries: KalturaBaseEntry[], totalCount?: number }>;
  queryDuringBootstrap(): boolean;
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
    customMetadata: GroupedListType,
    limits: number
}


@Injectable()
export class EntriesStore extends FiltersStoreBase<EntriesFilters> implements OnDestroy {
    private _entries = {
        data: new BehaviorSubject<{ items: KalturaMediaEntry[], totalCount: number }>({items: [], totalCount: 0}),
        state: new BehaviorSubject<{ loading: boolean, errorMessage: string }>({loading: false, errorMessage: null})
    };

    private _paginationCacheToken = 'default';
    private _isReady = false;
    private _metadataProfiles: { id: number, name: string, lists: { id: string, name: string }[] }[];
    private _querySubscription: ISubscription;

    public readonly entries =
        {
            data$: this._entries.data.asObservable(),
            state$: this._entries.state.asObservable(),
            data: () => {
                return this._entries.data.getValue().items;
            }
        };

    public set paginationCacheToken(token: string) {
        this._paginationCacheToken = typeof token === 'string' && token !== '' ? token : 'default';
    }

    constructor(private kalturaServerClient: KalturaClient,
                private browserService: BrowserService,
                private metadataProfileService: MetadataProfileStore,
                @Inject(EntriesDataProviderToken) private _dataProvider: EntriesDataProvider,
                _logger: KalturaLogger) {
        super(_logger);
        this._prepare();
    }


    protected _preFilter(updates: Partial<EntriesFilters>): Partial<EntriesFilters> {
        if (typeof updates.pageIndex === 'undefined') {
            // reset page index to first page everytime filtering the list by any filter that is not page index
            updates.pageIndex = 0;
        }

        return updates;
    }

    private _prepare(): void {
        if (!this._isReady) {
            this._entries.state.next({loading: true, errorMessage: null});
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
                        this._metadataProfiles = metadataProfiles.items.map(metadataProfile => (
                            {
                                id: metadataProfile.id,
                                name: metadataProfile.name,
                                lists: (metadataProfile.items || []).map(item => ({id: item.id, name: item.name}))
                            }));

                        const defaultPageSize = this.browserService.getFromLocalStorage(this._getPaginationCacheKey());
                        if (defaultPageSize !== null && (defaultPageSize !== this.cloneFilter('pageSize', null))) {
                            this.filter({
                                pageSize: defaultPageSize
                            });
                        }

                        this._registerToFilterStoreDataChanges();

                        if (this._dataProvider.queryDuringBootstrap()) {
                          this._executeQuery();
                        }
                    },
                    (error) => {
                        this._entries.state.next({loading: false, errorMessage: error.message});
                    }
                );
        }
    }

    private _registerToFilterStoreDataChanges(): void {
        this.filtersChange$
            .cancelOnDestroy(this)
            .subscribe(() => {
              console.warn('filtersChanged');
                this._executeQuery();
            });

    }

    private _getPaginationCacheKey(): string {
        return `entries.${this._paginationCacheToken}.list.pageSize`;
    }

    ngOnDestroy() {
        this._entries.state.complete();
        this._entries.data.complete();
    }

    public reload(): void {
        if (this._entries.state.getValue().loading) {
            return;
        }

        if (this._isReady) {
            this._executeQuery();
        } else {
            this._prepare();
        }
    }

    private _executeQuery(): void {

        if (this._querySubscription) {
            this._querySubscription.unsubscribe();
            this._querySubscription = null;
        }

        const pageSize = this.cloneFilter('pageSize', null);
        if (pageSize) {
            this.browserService.setInLocalStorage(this._getPaginationCacheKey(), pageSize);
        }

        this._entries.state.next({loading: true, errorMessage: null});
        this._querySubscription = this._dataProvider.executeQuery(this._getFiltersAsReadonly(), this._metadataProfiles)
            .cancelOnDestroy(this)
            .subscribe(
                response => {
                    this._querySubscription = null;

                    this._entries.state.next({loading: false, errorMessage: null});

                    this._entries.data.next({
                        items: <any[]>response.entries,
                        totalCount: <number>response.totalCount
                    });
                },
                error => {
                    this._querySubscription = null;
                    const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
                    this._entries.state.next({loading: false, errorMessage});
                });


    }

    public deleteEntry(entryId: string): Observable<void> {

        return Observable.create(observer => {
            let subscription: ISubscription;
            if (entryId && entryId.length) {
                subscription = this.kalturaServerClient.request(new BaseEntryDeleteAction({entryId: entryId})).subscribe(
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

    protected _createDefaultFiltersValue(): EntriesFilters {
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
            customMetadata: {},
            limits: 200,
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
            customMetadata: new GroupedListAdapter(),
            limits: new NumberTypeAdapter()
        };
    }
}
