import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { KalturaAPIClient } from '@kaltura-ng2/kaltura-api';
import { BaseEntryService, KalturaMediaEntryFilter, KalturaDetachedResponseProfile, KalturaFilterPager } from '@kaltura-ng2/kaltura-api/base-entry';

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
        let filter, pager, responseProfile;

        filter = new KalturaMediaEntryFilter();
        const orderBy = filterArgs.sortBy ? (filterArgs.sortDirection === SortDirection.Desc ? '-' : '+')  + filterArgs.sortBy : '';
            Object.assign(filter, {mediaTypeIn : "1,2,5,6,201", freeText: filterArgs.searchText,
        orderBy : orderBy});

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
                    },
                    () =>
                    {
                        observe.next(false);
                    }
                )
        });


    }

}

