import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import {
    KalturaContentDistributionSearchItem,
    KalturaSearchOperatorType,
    KalturaSearchOperator,
    KalturaMediaEntryFilter,
    KalturaDetachedResponseProfile,
    KalturaFilterPager,
    KalturaBaseEntryListResponse
     } from '@kaltura-ng2/kaltura-api'


import {KalturaServerClient} from '@kaltura-ng2/kaltura-api';
import {BaseEntryService} from '@kaltura-ng2/kaltura-api/services';

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
    categoriesIdsMatchOr? : string;
    createdAtLessThanOrEqual? : Date;
    createdAtGreaterThanOrEqual? : Date;
};

export interface Entries{
    items : any[],
    totalCount : number
}

@Injectable()
export class ContentEntriesStore {
    private _entries:BehaviorSubject<Entries> = new BehaviorSubject({items: [], totalCount: 0});

    public entries$:Observable<Entries> = this._entries.asObservable();

    constructor(private kalturaServerClient :KalturaServerClient) {

    }


    public filter(filterArgs:FilterArgs, filterColumns?:string):Observable<boolean> {
        return Observable.create(observe => {
            let filter:KalturaMediaEntryFilter, pager, responseProfile;

            const advancedSearch = new KalturaSearchOperator();
            advancedSearch.type = KalturaSearchOperatorType.SearchAnd;

            filter = new KalturaMediaEntryFilter();
            const orderBy = filterArgs.sortBy ? (filterArgs.sortDirection === SortDirection.Desc ? '-' : '+') + filterArgs.sortBy : '';
            Object.assign(filter, {
                freeText: filterArgs.searchText,
                orderBy: orderBy,
                categoriesIdsMatchOr : filterArgs.categoriesIdsMatchOr,
                createdAtGreaterThanOrEqual : filterArgs.createdAtGreaterThanOrEqual ? filterArgs.createdAtGreaterThanOrEqual.getTime() / 1000 : null,
                createdAtLessThanOrEqual : filterArgs.createdAtLessThanOrEqual ? filterArgs.createdAtLessThanOrEqual.getTime() / 1000 : null
            });

            if (filterArgs.mediaTypeIn && filterArgs.mediaTypeIn.length) {
                filter.mediaTypeIn = R.join(',', filterArgs.mediaTypeIn);
            } else {
                filter.mediaTypeIn = '1,2,5,6,201';
            }

            if (filterArgs.statusIn && filterArgs.statusIn.length) {
                filter.statusIn = R.join(',', filterArgs.statusIn);
            } else {
                filter.statusIn = '-1,-2,0,1,2,7,4';
            }

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

            if (advancedSearch.items.length > 0) {
                filter.advancedSearch = advancedSearch;
            }

            pager = new KalturaFilterPager();
            Object.assign(pager, {pageSize: filterArgs.pageSize, pageIndex: filterArgs.pageIndex});

            if (filterColumns) {
                responseProfile = new KalturaDetachedResponseProfile();
                Object.assign(responseProfile, {type: 1, fields: filterColumns});

            }

            // TODO [KMC] we need to cancel all previous requests otherwise we might override entries$ with older responses
            const request = BaseEntryService.list(filter, pager).setResponseProfile(responseProfile).setCompletion(
                (response => {
                    if (response.result) {
                        const result = <KalturaBaseEntryListResponse>response.result;
                        this._entries.next({items: <any[]>result.objects, totalCount: <number>result.totalCount});
                    }else
                    {
                        // handle response.error
                    }
                }
            ));


            this.kalturaServerClient.request(request).subscribe(
                (response) => {
                    observe.next(true);
                    observe.complete();
                },
                () => {
                    observe.next(false);
                    observe.complete();
                }
            );
        });
    }
}

