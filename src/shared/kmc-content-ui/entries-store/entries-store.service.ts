import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import {Scheduler} from 'rxjs/rx';
import {Subscription} from 'rxjs/Subscription';

import {
    KalturaSearchOperator,
    KalturaMediaEntryFilter,
    KalturaDetachedResponseProfile,
    KalturaFilterPager,
    KalturaBaseEntryListResponse,
    KalturaResponseProfileType
} from '@kaltura-ng2/kaltura-api/types'

import { KalturaSearchOperatorType} from '@kaltura-ng2/kaltura-api/kaltura-enums'

import {KalturaServerClient} from '@kaltura-ng2/kaltura-api';
import {BaseEntryListAction} from '@kaltura-ng2/kaltura-api/services/base-entry';

import * as R from 'ramda';
import {FilterItem, FilterRequestContext} from "./filter-item";

export type UpdateStatus = {
    loading : boolean;
    errorMessage : string;
};

export interface Entries{
    items : any[],
    totalCount : number
}

export interface QueryData
{
    pageIndex? : number,
    pageSize? : number,
    sortBy? : string,
    sortDirection? : SortDirection,
    fields? : string;

}

export enum SortDirection {
    Desc,
    Asc
}

export interface filterUpdateData {
    filters: FilterItem[];
    addedFilters: FilterItem[];
    removedFilters: FilterItem[];
    data : QueryData;
}

@Injectable()
export class EntriesStore {

    private _entries: BehaviorSubject<Entries> = new BehaviorSubject({items: [], totalCount: 0});
    private _status : BehaviorSubject<UpdateStatus> = new BehaviorSubject<UpdateStatus>({ loading : false, errorMessage : null});
    private _runQuery : ReplaySubject<filterUpdateData> = new ReplaySubject<filterUpdateData>(1,null,Scheduler.async);
    private _runQuerySubscription : Subscription;

    private _activeFilters : FilterItem[] = [];
    private _activeFiltersMap : {[key : string] : FilterItem[]} = {};
    private _queryData : QueryData = { sortDirection : SortDirection.Asc};

    public entries$: Observable<Entries> = this._entries.asObservable();
    public status$: Observable<UpdateStatus> = this._status.asObservable();
    public runQuery$ : Observable<filterUpdateData> = this._runQuery.asObservable();


    constructor(private kalturaServerClient: KalturaServerClient) {
        this.subscribeToChanges();
    }

    dispose()
    {
        this._runQuerySubscription.unsubscribe();
        this._runQuerySubscription = null;
        this._activeFilters = null;
        this._activeFiltersMap = null;
        this._queryData = null;
        this._entries.complete();
        this._entries.unsubscribe();
    }

    private subscribeToChanges() : void {
        // switchMap is used to ignore old requests

        this._runQuerySubscription = this._runQuery
            .do(() => {
                this._status.next({loading: true, errorMessage: null});
            })
            .switchMap(this._updateEntries.bind(this))
            .subscribe(
                result => {

                    if (result instanceof KalturaBaseEntryListResponse) {
                        this._entries.next({items: <any[]>result.objects, totalCount: <number>result.totalCount});
                        this._status.next({loading: false, errorMessage: null});
                    } else {
                        this._status.next({loading: false, errorMessage: (<Error>result).message});
                    }
                },
                error => {
                    // TODO [kmc] should not reach here
                    this._status.next({loading: false, errorMessage: 'fatal failure while querying'});
                },
                () => {
                    // TODO [kmc] should not reach here
                }
            );
    }

    public updateQuery(query : QueryData)
    {
        Object.assign(this._queryData,query);
        this._runQuery.next({ filters : this._activeFilters, removedFilters : [], addedFilters : [], data : this._queryData });
    }

    public removeFiltersByType(filterType : {new(...args : any[]) : FilterItem;}) : void {
        if (filterType && filterType.name) {
            const filtersOfType = this._activeFiltersMap[filterType.name];

            if (filtersOfType) {
                this.removeFilters(...filtersOfType);
            }
        }
    }

    public getFirstFilterByType<T extends FilterItem>(filterType : {new(...args : any[]) : T;}) : T
    {
        const filters = <T[]>this.getFiltersByType(filterType);
        return filters && filters.length > 0 ? filters[0] : null;
    }

    public getFiltersByType<T extends FilterItem>(filterType : {new(...args : any[]) : T;}) : T[] {
        if (filterType.name) {
            const filtersOfType = <T[]>this._activeFiltersMap[filterType.name];
            return filtersOfType ? [...filtersOfType] : [];
        } else {
            return [];
        }
    }

    public clearAllFilters()
    {
        const previousFilters = this._activeFilters;
        this._activeFilters = [];
        this._activeFiltersMap = {};
        this._runQuery.next({ filters : this._activeFilters, removedFilters : previousFilters, addedFilters : [], data : this._queryData });
    }

    public reload() : void
    {
        this._runQuery.next({ filters : this._activeFilters, removedFilters : [], addedFilters : [], data : this._queryData });
    }

    public addFilters(...filters : FilterItem[]) : void{
        if (filters)
        {
            const addedFilters = [];

            filters.forEach(filter =>
            {
                const index = this._activeFilters.indexOf(filter);

                if (index === -1 )
                {
                    addedFilters.push(filter);
                    this._activeFiltersMap[filter.constructor.name] = this._activeFiltersMap[filter.constructor.name] || [];
                    this._activeFiltersMap[filter.constructor.name].push(filter);
                }
            });

            if (addedFilters.length > 0)
            {
                this._activeFilters = [...this._activeFilters, ...addedFilters];
                this._queryData.pageIndex = 1;
                this._runQuery.next({ filters : this._activeFilters, removedFilters : [], addedFilters : addedFilters, data : this._queryData  });
            }
        }
    }

    public removeFilters(...filters : FilterItem[]) : void{
        if (filters)
        {
            const removedFilters : FilterItem[] = [];

            filters.forEach(filter =>
            {
               const index = this._activeFilters.indexOf(filter);

               if (index >= 0)
               {
                   removedFilters.push(filter);
                   this._activeFilters = R.remove(index,1, this._activeFilters);

                   const filterByType = this._activeFiltersMap[filter.constructor.name];
                   this._activeFiltersMap[filter.constructor.name] = R.remove(filterByType.indexOf(filter),1, filterByType);
               }
            });

            if (removedFilters.length > 0)
            {
                this._queryData.pageIndex = 1;
                this._runQuery.next({ filters : this._activeFilters, removedFilters : removedFilters, addedFilters : [], data : this._queryData  });
            }
        }
    }

    private _updateEntries({filters : activeFilers, data : queryData } : { filters : FilterItem[], data : QueryData}) : Observable<KalturaBaseEntryListResponse | Error> {


        let filter: KalturaMediaEntryFilter = new KalturaMediaEntryFilter();

        const advancedSearch = filter.advancedSearch = new KalturaSearchOperator();
        advancedSearch.type = KalturaSearchOperatorType.SearchAnd;

        const requestContext: FilterRequestContext = {
            filter: filter,
            advancedSearch : advancedSearch
        };

        let responseProfile: KalturaDetachedResponseProfile = null;
        let pagination: KalturaFilterPager = null;

        if (activeFilers) {
            activeFilers.forEach(filter => {
                filter._buildRequest(requestContext);
            });
        }

        if (advancedSearch.items && advancedSearch.items.length === 0)
        {
            delete filter.advancedSearch;
        }

        if (!filter.mediaTypeIn) {
            filter.mediaTypeIn = '1,2,5,6,201';
        }

        if (!filter.statusIn) {
            filter.statusIn = '-1,-2,0,1,2,7,4';
        }

        if (queryData.sortBy) {
            filter.orderBy = `${queryData.sortDirection === SortDirection.Desc ? '-' : '+'}${queryData.sortBy}`;
        }

        if (queryData.fields) {
            responseProfile = new KalturaDetachedResponseProfile();
            responseProfile.type = KalturaResponseProfileType.IncludeFields;
            responseProfile.fields = queryData.fields;
        }

        if (queryData.pageIndex || queryData.pageSize) {
            pagination = new KalturaFilterPager();
            pagination.pageSize = queryData.pageSize;
            pagination.pageIndex = queryData.pageIndex;
        }


        return <any>this.kalturaServerClient.request(
            new BaseEntryListAction({
                filter: requestContext.filter,
                pager: pagination,
                responseProfile: responseProfile
            })
        )
            .map(
                response => {
                    if (response.error) {
                        return new Error(response.error.message);
                    } else {
                        return response.result;
                    }
                }
            )
            .catch(err => Observable.of(err));
    }
}
