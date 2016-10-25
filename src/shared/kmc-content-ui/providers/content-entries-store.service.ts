import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { KalturaAPIClient } from '@kaltura-ng2/kaltura-api';
import { BaseEntryService, KalturaMediaEntryFilter, KalturaDetachedResponseProfile, KalturaFilterPager } from '@kaltura-ng2/kaltura-api/base-entry';

export type FilterArgs = {
    pageIndex : number;
    pageSize : number;
    searchText? : string;
    videoOnly? : boolean;
};

@Injectable()
export class ContentEntriesStore
{
    private _entries: BehaviorSubject<any> = new BehaviorSubject([]);
    public entries$: Observable<any> = this._entries.asObservable();

    constructor(private kalturaAPIClient : KalturaAPIClient) {

    }

    public filter(filterArgs : FilterArgs, filterColumns? : string) : Observable<boolean>
    {
        let filter, pager, responseProfile;

        filter = new KalturaMediaEntryFilter();
        Object.assign(filter, {mediaTypeIn : "1,2,5,6,201", freeText: filterArgs.searchText});

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
                .map(response => response.objects)
                .subscribe(
                    (entries) => {
                        this._entries.next(entries);
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

