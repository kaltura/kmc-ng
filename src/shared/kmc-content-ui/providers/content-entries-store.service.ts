import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import {Scheduler} from 'rxjs/rx';

import {
    KalturaContentDistributionSearchItem,
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
import {FilterItem, FilterRequestContext} from "../content-entries-filter/filter-item";



export type UpdateStatus = {
    loading : boolean;
    errorMessage : string;
};

export interface Entries{
    items : any[],
    totalCount : number
}



export interface filterUpdateData {
    filter: FilterItem[];
    added: FilterItem[];
    removed: FilterItem[];
}

@Injectable()
export class ContentEntriesStore {
    private _entries: BehaviorSubject<Entries> = new BehaviorSubject({items: [], totalCount: 0});
    private _status : BehaviorSubject<UpdateStatus> = new BehaviorSubject<UpdateStatus>({ loading : false, errorMessage : null});

    private _activeFilters : FilterItem[] = [];
    private _activeFiltersMap : {[key : string] : FilterItem[]} = {};

    private _filterUpdate : ReplaySubject<filterUpdateData> = new ReplaySubject<filterUpdateData>(1,null,Scheduler.async);

    public entries$: Observable<Entries> = this._entries.asObservable();
    public status$: Observable<UpdateStatus> = this._status.asObservable();
    public filterUpdate$ : Observable<filterUpdateData> = this._filterUpdate.asObservable();

    constructor(private kalturaServerClient: KalturaServerClient) {
        this.subscribeToUpdateChanges();
    }

    public getActiveFilters(filterType? : {new(...args : any[]) : FilterItem;}) : FilterItem[]
    {
        if (filterType)
        {
            const filtersOfType = this._activeFiltersMap[filterType.name];
            return filtersOfType ? [...filtersOfType] : [];
        }else {
            return [...this._activeFilters];
        }
    }
    subscribeToUpdateChanges() : void {
        // switchMap is used to ignore old requests
        this._filterUpdate
            .do(()=>
            {
                this._status.next({loading : true, errorMessage : null});
            })
            .switchMap(this._updateEntries.bind(this))
            .subscribe(
                result => {

                    if (result instanceof KalturaBaseEntryListResponse) {
                        this._entries.next({items: <any[]>result.objects, totalCount: <number>result.totalCount});
                        this._status.next({loading : false, errorMessage : null});
                    } else {
                        this._status.next({loading : false, errorMessage : (<Error>result).message});
                    }
                },
                error => {
                    // TODO [kmc] should not reach here
                },
                () => {
                    // TODO [kmc] should not reach here
                }
            );
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
                this._filterUpdate.next({ filter : this._activeFilters, removed : [], added : addedFilters });
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
                this._filterUpdate.next({ filter : this._activeFilters, removed : removedFilters, added : [] });
            }
        }
    }

    private _updateEntries({filter : activeFilers} : { filter : FilterItem[]}) : Observable<KalturaBaseEntryListResponse | Error> {


        let filter: KalturaMediaEntryFilter, pager, responseProfile;

        const advancedSearch = new KalturaSearchOperator();
        advancedSearch.type = KalturaSearchOperatorType.SearchAnd;

        // build baseEntry > List > Filter object
        filter = new KalturaMediaEntryFilter();
        // filter.orderBy = updateArgs.sortBy ? (updateArgs.sortDirection === SortDirection.Desc ? '-' : '+') + updateArgs.sortBy : '';
        // filter.createdAtGreaterThanOrEqual = toServerDate(updateArgs.createdAtFrom);
        // filter.createdAtLessThanOrEqual = toServerDate(updateArgs.createdAtTo);
        // filter.freeText = updateArgs.searchText;
        // this.updateCategoriesIdsMatchOr(updateArgs, filter);
        // this.updateMediaTypeIn(updateArgs, filter);
        // this.updateStatusIn(updateArgs, filter);
        // this.updateDistributionProfiles(updateArgs, advancedSearch);

        // add advanced search if it was filled with items
        // if (advancedSearch.items.length > 0) {
        //     filter.advancedSearch = advancedSearch;
        // }

        // build baseEntry > List > pager object
         pager = new KalturaFilterPager();
        // pager.pageSize = updateArgs.pageSize;
        // pager.pageIndex = updateArgs.pageIndex;

        // build baseEntry > List > response profile object
        // if (updateArgs.filterColumns) {
        //    responseProfile = new KalturaDetachedResponseProfile();
        //     responseProfile.type = KalturaResponseProfileType.IncludeFields;
        //     responseProfile.fields = updateArgs.filterColumns;
        // }

        if (activeFilers)
        {
            const requestContext : FilterRequestContext = {
                filter : filter
            };

            activeFilers.forEach(filter =>
            {
                filter._buildRequest(requestContext);
            });

            if (!filter.mediaTypeIn)
            {
                filter.mediaTypeIn = '1,2,5,6,201';
            }

            if (!filter.statusIn)
            {
                filter.statusIn = '-1,-2,0,1,2,7,4';
            }
        }

        return <any>this.kalturaServerClient.request(
            new BaseEntryListAction({filter, pager, responseProfile})
            )
            .map(
                response =>
                {
                    if (response.error)
                    {
                        return new Error(response.error.message);
                    }else
                    {
                        return response.result;
                    }
                }
            )
            .catch(err => Observable.of(err));
    }
    //
    //
    // private updateCategoriesIdsMatchOr(filterArgs: UpdateArgs, filter: KalturaMediaEntryFilter): void {
    //     if (filterArgs.categories && filterArgs.categories.length) {
    //         filter.categoriesIdsMatchOr = R.join(',', filterArgs.categories);
    //     }
    // }
    //
    // private updateStatusIn(filterArgs: UpdateArgs, filter: KalturaMediaEntryFilter): void {
    //     if (filterArgs.statuses && filterArgs.statuses.length) {
    //         filter.statusIn = R.join(',', filterArgs.statuses);
    //     } else {
    //         filter.statusIn = '-1,-2,0,1,2,7,4';
    //     }
    // }
    //
    // private updateDistributionProfiles(filterArgs:UpdateArgs, advancedSearch : KalturaSearchOperator) : void
    // {
    //     if (filterArgs.distributionProfiles && filterArgs.distributionProfiles.length) {
    //         const distributionProfiles = new KalturaSearchOperator();
    //         distributionProfiles.type = KalturaSearchOperatorType.SearchOr;
    //         advancedSearch.items.push(distributionProfiles);
    //
    //         R.forEach(item => {
    //             const newItem = new KalturaContentDistributionSearchItem();
    //             newItem.distributionProfileId = item;
    //             newItem.hasEntryDistributionValidationErrors = false;
    //             newItem.noDistributionProfiles = false;
    //             distributionProfiles.items.push(newItem)
    //         }, filterArgs.distributionProfiles);
    //     }
    // }
}
