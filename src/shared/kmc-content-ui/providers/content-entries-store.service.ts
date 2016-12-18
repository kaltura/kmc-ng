import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

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
    return value ? value.getTime() / 1000 : null;
}

@Injectable()
export class ContentEntriesStore {
    private _entries: BehaviorSubject<Entries> = new BehaviorSubject({items: [], totalCount: 0});

    public entries$: Observable<Entries> = this._entries.asObservable();

    constructor(private kalturaServerClient: KalturaServerClient) {

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
            filter.categoriesIdsMatchOr = R.join(',', filterArgs.categories);
        }
    }

    private updateStatusIn(filterArgs: FilterArgs, filter: KalturaMediaEntryFilter): void {
        if (filterArgs.statuses && filterArgs.statuses.length) {
            filter.statusIn = R.join(',', filterArgs.statuses);
        } else {
            filter.statusIn = '-1,-2,0,1,2,7,4';
        }
    }

    private updateDistributionProfiles(filterArgs:FilterArgs,  advancedSearch : KalturaSearchOperator) : void
    {
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

    public filter(filterArgs: FilterArgs): Observable<boolean> {
        return Observable.create(observe => {
            let filter: KalturaMediaEntryFilter, pager, responseProfile;

            const advancedSearch = new KalturaSearchOperator();
            advancedSearch.type = KalturaSearchOperatorType.SearchAnd;

            // build baseEntry > List > Filter object
            filter = new KalturaMediaEntryFilter();
            filter.orderBy = filterArgs.sortBy ? (filterArgs.sortDirection === SortDirection.Desc ? '-' : '+') + filterArgs.sortBy : '';
            filter.createdAtGreaterThanOrEqual = toServerDate(filterArgs.createdAtFrom);
            filter.createdAtLessThanOrEqual = toServerDate(filterArgs.createdAtTo);
            filter.freeText = filterArgs.searchText;
            this.updateCategoriesIdsMatchOr(filterArgs,filter);
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

            // TODO [KMC] we need to cancel all previous requests otherwise we might override entries$ with older responses

            const request = new BaseEntryListAction({filter, pager, responseProfile})
                .setCompletion(
                    (response => {
                            if (response.result) {
                                const result = <KalturaBaseEntryListResponse>response.result;
                                this._entries.next({items: <any[]>result.objects, totalCount: <number>result.totalCount});
                            } else {
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

