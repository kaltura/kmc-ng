import {Injectable} from '@angular/core';
import {KalturaClient} from 'kaltura-ngx-client';
import {UserListAction} from 'kaltura-ngx-client';
import {KalturaUserFilter} from 'kaltura-ngx-client';
import {KalturaFilterPager} from 'kaltura-ngx-client';

@Injectable()
export class ReviewService {

    constructor(private _kalturaServerClient: KalturaClient) {}

    public getUserNameByIds(query: string) {
        return this._kalturaServerClient.request(
            new UserListAction(
                {
                    filter: new KalturaUserFilter({
                        idIn: query
                    }),
                    pager: new KalturaFilterPager({
                        pageIndex: 0,
                        pageSize: 500
                    })
                }
            )
        );
    }
}
