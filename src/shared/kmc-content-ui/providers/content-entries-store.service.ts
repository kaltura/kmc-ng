import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { KalturaAPIClient } from '@kaltura-ng2/kaltura-api';
import {
    KalturaContentDistributionSearchItem,
    KalturaSearchOperatorType,
    KalturaSearchOperator,
    BaseEntryService,
    KalturaMediaEntryFilter,
    KalturaDetachedResponseProfile,
    KalturaFilterPager } from '@kaltura-ng2/kaltura-api/base-entry';

import * as R from 'ramda';

export enum SortDirection {
    Desc,
    Asc
}
export type FilterArgs = {
    sortBy : string;
    sortDirection : SortDirection;
    pageIndex : number;
    pageSize : number;
    searchText? : string;
    mediaTypeIn? : number[];
    statusIn? : number[];
    distributionProfiles? : number[];
};

export interface Entries{
    items : any[],
    totalCount : number
}

@Injectable()
export class ContentEntriesStore
{
    private _entries: BehaviorSubject<Entries> = new BehaviorSubject({items : [], totalCount : 0});

    public entries$: Observable<Entries> = this._entries.asObservable();

    constructor(private kalturaAPIClient : KalturaAPIClient) {

    }


    public filter(filterArgs : FilterArgs, filterColumns? : string) : Observable<boolean>
    {
        let filter : KalturaMediaEntryFilter, pager, responseProfile;

        const advancedSearch = new KalturaSearchOperator();
        advancedSearch.type = KalturaSearchOperatorType.SearchAnd;

        filter = new KalturaMediaEntryFilter();
        const orderBy = filterArgs.sortBy ? (filterArgs.sortDirection === SortDirection.Desc ? '-' : '+')  + filterArgs.sortBy : '';
            Object.assign(filter, {freeText: filterArgs.searchText, orderBy : orderBy});

        if (filterArgs.mediaTypeIn && filterArgs.mediaTypeIn.length)
        {
            filter.mediaTypeIn = R.join(',', filterArgs.mediaTypeIn);
        }else
        {
            filter.mediaTypeIn = '1,2,5,6,201';
        }

        if (filterArgs.statusIn && filterArgs.statusIn.length)
        {
            filter.statusIn = R.join(',', filterArgs.statusIn);
        }else {
            filter.statusIn = '-1,-2,0,1,2,7,4';
        }

        if (filterArgs.distributionProfiles && filterArgs.distributionProfiles.length)
        {
            const distributionProfiles = new KalturaSearchOperator();
            distributionProfiles.type = KalturaSearchOperatorType.SearchOr;
            advancedSearch.items.push(distributionProfiles);

            R.forEach(item => {
                const newItem = new KalturaContentDistributionSearchItem();
                newItem.distributionProfileId = item;
                newItem.hasEntryDistributionValidationErrors = false;
                newItem.noDistributionProfiles = false;
                distributionProfiles.items.push(newItem)
            },filterArgs.distributionProfiles);
        }

        if (advancedSearch.items.length > 0)
        {
            filter.advancedSearch = advancedSearch;
        }

        pager = new KalturaFilterPager();
        Object.assign(pager, { pageSize : filterArgs.pageSize, pageIndex : filterArgs.pageIndex});

        if (filterColumns)
        {
            responseProfile = new KalturaDetachedResponseProfile();
            Object.assign(responseProfile, { type : 1, fields : filterColumns});

        }

        return Observable.create(observe =>
        {
            BaseEntryService.list(filter, pager, responseProfile)
                .execute(this.kalturaAPIClient)
                .subscribe(
                    (response) => {
                        this._entries.next({ items : <any[]>response.objects, totalCount : <number>response.totalCount});
                        observe.next(true);
                        observe.complete();
                    },
                    () =>
                    {
                        observe.next(false);
                        observe.complete();
                    }
                )
        });


    }

}

