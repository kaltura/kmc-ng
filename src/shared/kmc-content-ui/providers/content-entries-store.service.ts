import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {  Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import {asap} from 'rxjs/scheduler/asap';

import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';


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

import {KalturaServerClient, KalturaResponse} from '@kaltura-ng2/kaltura-api';
import {BaseEntryListAction} from '@kaltura-ng2/kaltura-api/services/base-entry';


import * as R from 'ramda';

export enum SortDirection {
    Desc,
    Asc
}
export type FilterArgs = {
  categories? : number[];
  createdAtFrom? : Date;
  createdAtTo? : Date;
  distributionProfiles? : number[];
  filterColumns?: string;
  mediaTypes? : number[];
  pageIndex : number;
  pageSize : number;
  searchText? : string;
  sortBy : string;
  sortDirection : SortDirection;
  statuses? : number[];
};

export interface Entries{
    items : any[],
    totalCount : number
}

function toServerDate(value? : Date) : number
{
  return value ? Math.round(value.getTime() / 1000) : null;
}

@Injectable()
export class ContentEntriesStore {
    private _entries: BehaviorSubject<Entries> = new BehaviorSubject({items: [], totalCount: 0});
    private _entriesFilter: Subject<FilterArgs> = new Subject<FilterArgs>();

    public entries$: Observable<Entries> = this._entries.asObservable();

    constructor(private kalturaServerClient: KalturaServerClient) {

        let i=1;
        // we use 'switchMap' so only latest response will be handled (cancel active once they are replaced)
        this._entriesFilter
            .do((value) => {i++;console.log('start' + i);})
            .switchMap(this.getEntries.bind(this))
            .observeOn(asap)
            .do((value) => {console.log('end' + i)})
            .subscribe(this.updateEntries.bind(this));
    }

    temp= 1;
    temp2= 1;

    private updateEntries(response : KalturaResponse<KalturaBaseEntryListResponse>): void {

        if (this.temp % 2 === 0)
        {
            throw new Error("updateEntries");
        }

        this.temp +=1;

        if (response.result) {
            const result = <KalturaBaseEntryListResponse>response.result;
            this._entries.next({
                items: <any[]>result.objects,
                totalCount: <number>result.totalCount
            });
        } else {
            // TODO [kmc] handle response.error
        }
    }

    private getEntries(filterArgs: FilterArgs): Observable<KalturaBaseEntryListResponse> {

        if (this.temp2 % 5 === 0)
        {
            throw new Error("getEntries");
        }

        this.temp2 +=1;

        let filter: KalturaMediaEntryFilter, pager, responseProfile;

        const advancedSearch = new KalturaSearchOperator();
        advancedSearch.type = KalturaSearchOperatorType.SearchAnd;

        // build baseEntry > List > Filter object
        filter = new KalturaMediaEntryFilter();
        filter.orderBy = filterArgs.sortBy ? (filterArgs.sortDirection === SortDirection.Desc ? '-' : '+') + filterArgs.sortBy : '';
        filter.createdAtGreaterThanOrEqual = toServerDate(filterArgs.createdAtFrom);
        filter.createdAtLessThanOrEqual = toServerDate(filterArgs.createdAtTo);
        filter.freeText = filterArgs.searchText;
        this.updateCategoriesIdsMatchOr(filterArgs, filter);
        this.updateMediaTypeIn(filterArgs, filter);
        this.updateStatusIn(filterArgs, filter);
        this.updateDistributionProfiles(filterArgs, advancedSearch);

        // add advanced search if it was filled with items
        if (advancedSearch.items.length > 0) {
            filter.advancedSearch = advancedSearch;
        }

        // build baseEntry > List > pager object
        pager = new KalturaFilterPager();
        pager.pageSize = filterArgs.pageSize;
        pager.pageIndex = filterArgs.pageIndex;

        // build baseEntry > List > response profile object
        if (filterArgs.filterColumns) {
            responseProfile = new KalturaDetachedResponseProfile();
            responseProfile.type = KalturaResponseProfileType.IncludeFields;
            responseProfile.fields = filterArgs.filterColumns;
        }

        return <any>this.kalturaServerClient.request(
            new BaseEntryListAction({filter, pager, responseProfile})
        );
    }

    private updateMediaTypeIn(filterArgs: FilterArgs, filter: KalturaMediaEntryFilter): void {
        if (filterArgs.mediaTypes && filterArgs.mediaTypes.length) {
            filter.mediaTypeIn = R.join(',', filterArgs.mediaTypes);
        } else {
            filter.mediaTypeIn = '1,2,5,6,201';
        }
    }

    private updateCategoriesIdsMatchOr(filterArgs: FilterArgs, filter: KalturaMediaEntryFilter): void {
        if (filterArgs.categories && filterArgs.categories.length) {
            filter.categoriesIdsMatchOr = R.join(',', filterArgs.categories) ;
        }
    }

    private updateStatusIn(filterArgs: FilterArgs, filter: KalturaMediaEntryFilter): void {
        if (filterArgs.statuses && filterArgs.statuses.length) {
            filter.statusIn = R.join(',', filterArgs.statuses);
        } else {
            filter.statusIn = '-1,-2,0,1,2,7,4';
        }
    }

    private updateDistributionProfiles(filterArgs: FilterArgs, advancedSearch: KalturaSearchOperator): void {
        if (filterArgs.distributionProfiles && filterArgs.distributionProfiles.length) {
            const distributionProfiles = new KalturaSearchOperator();
            distributionProfiles.type = KalturaSearchOperatorType.SearchOr;
            advancedSearch.items.push(distributionProfiles);

            R.forEach(item => {
                const newItem = new KalturaContentDistributionSearchItem();
                newItem.distributionProfileId = item;
                newItem.hasEntryDistributionValidationErrors = false;
                newItem.noDistributionProfiles = false;
                distributionProfiles.items.push(newItem)
            }, filterArgs.distributionProfiles);
        }
    }

    public reload(args : FilterArgs): void {
        this._entriesFilter.next(args);
    }

}

