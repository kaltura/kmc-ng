import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
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

export type UpdateStatus = {
    loading : boolean;
    errorMessage : string;
};

export type UpdateArgs = {
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
    private _status : BehaviorSubject<UpdateStatus> = new BehaviorSubject<UpdateStatus>({ loading : false, errorMessage : null});
    private _entriesFilter : Subject<UpdateArgs> = new Subject<UpdateArgs>();

    public entries$: Observable<Entries> = this._entries.asObservable();
    public status$: Observable<UpdateStatus> = this._status.asObservable();

    constructor(private kalturaServerClient: KalturaServerClient) {
        this.subscribeToUpdateChanges();
    }

    subscribeToUpdateChanges() : void
    {
        this._entriesFilter
            .switchMap(this._updateEntries.bind(this))
            .subscribe(
                response =>
                {
                    if (response.result) {
                        const result = <KalturaBaseEntryListResponse>response.result;
                        this._entries.next({items: <any[]>result.objects, totalCount: <number>result.totalCount});
                    } else {
                        // handle response.error
                    }
                },
                error =>
                {

                }
            )

    }

    private _updateEntries(updateArgs : UpdateArgs) : Observable<KalturaBaseEntryListResponse> {
        let filter: KalturaMediaEntryFilter, pager, responseProfile;

        const advancedSearch = new KalturaSearchOperator();
        advancedSearch.type = KalturaSearchOperatorType.SearchAnd;

        // build baseEntry > List > Filter object
        filter = new KalturaMediaEntryFilter();
        filter.orderBy = updateArgs.sortBy ? (updateArgs.sortDirection === SortDirection.Desc ? '-' : '+') + updateArgs.sortBy : '';
        filter.createdAtGreaterThanOrEqual = toServerDate(updateArgs.createdAtFrom);
        filter.createdAtLessThanOrEqual = toServerDate(updateArgs.createdAtTo);
        filter.freeText = updateArgs.searchText;
        this.updateCategoriesIdsMatchOr(updateArgs, filter);
        this.updateMediaTypeIn(updateArgs, filter);
        this.updateStatusIn(updateArgs, filter);
        this.updateDistributionProfiles(updateArgs, advancedSearch);

        // add advanced search if it was filled with items
        if (advancedSearch.items.length > 0) {
            filter.advancedSearch = advancedSearch;
        }

        // build baseEntry > List > pager object
        pager = new KalturaFilterPager();
        pager.pageSize = updateArgs.pageSize;
        pager.pageIndex = updateArgs.pageIndex;

        // build baseEntry > List > response profile object
        if (updateArgs.filterColumns) {
            responseProfile = new KalturaDetachedResponseProfile();
            responseProfile.type = KalturaResponseProfileType.IncludeFields;
            responseProfile.fields = updateArgs.filterColumns;
        }

        // TODO [KMC] we need to cancel all previous requests otherwise we might override entries$ with older responses

        return this.kalturaServerClient.request(
            new BaseEntryListAction({filter, pager, responseProfile})
        ).flatMap(
            response =>
            {
                if (response.error)
                {
                    return Observable.throw(response.error.message);
                }else
                {
                    return response.result;
                }
            }
        );
    }

    private updateMediaTypeIn(filterArgs: UpdateArgs, filter: KalturaMediaEntryFilter): void {
        if (filterArgs.mediaTypes && filterArgs.mediaTypes.length) {
            filter.mediaTypeIn = R.join(',', filterArgs.mediaTypes);
        } else {
            filter.mediaTypeIn = '1,2,5,6,201';
        }
    }

    private updateCategoriesIdsMatchOr(filterArgs: UpdateArgs, filter: KalturaMediaEntryFilter): void {
        if (filterArgs.categories && filterArgs.categories.length) {
            filter.categoriesIdsMatchOr = R.join(',', filterArgs.categories);
        }
    }

    private updateStatusIn(filterArgs: UpdateArgs, filter: KalturaMediaEntryFilter): void {
        if (filterArgs.statuses && filterArgs.statuses.length) {
            filter.statusIn = R.join(',', filterArgs.statuses);
        } else {
            filter.statusIn = '-1,-2,0,1,2,7,4';
        }
    }

    private updateDistributionProfiles(filterArgs:UpdateArgs, advancedSearch : KalturaSearchOperator) : void
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

    public update(updateArgs: UpdateArgs): void {

        if (updateArgs)
        {
            this._entriesFilter.next(updateArgs);
        }
    }
}

