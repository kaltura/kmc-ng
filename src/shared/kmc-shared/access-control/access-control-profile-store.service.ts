import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { PartnerProfileStore } from '../partner-profile';
import { ISubscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/throw';

import { KalturaClient } from 'kaltura-ngx-client';
import { AccessControlListAction } from 'kaltura-ngx-client/api/types/AccessControlListAction';

import { KalturaAccessControlFilter } from 'kaltura-ngx-client/api/types/KalturaAccessControlFilter';
import { KalturaAccessControl } from 'kaltura-ngx-client/api/types/KalturaAccessControl';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { KalturaAccessControlListResponse } from 'kaltura-ngx-client/api/types/KalturaAccessControlListResponse';

@Injectable()
export class AccessControlProfileStore extends PartnerProfileStore
{
    private _cachedProfiles : KalturaAccessControl[] = [];

    constructor(private _kalturaServerClient: KalturaClient) {
    	super();
    }

    public get() : Observable<{items : KalturaAccessControl[]}>
    {
        return Observable.create(observer =>
        {
	        let sub: ISubscription;
            const cachedResults = this._cachedProfiles;
            if (cachedResults.length)
            {
                observer.next({items : cachedResults});
            }else {
	            sub = this._buildGetRequest().subscribe(
                    response =>
                    {
	                    sub = null;
                        observer.next({items : response.objects});
                        observer.complete();
                    },
                    error =>
                    {
	                    sub = null;
                        observer.error(error);
                    }
                );
            }
	        return () =>{
		        if (sub) {
			        sub.unsubscribe();
		        }
	        }
        });

    }

    private _buildGetRequest(): Observable<KalturaAccessControlListResponse> {
        const accessControlProfilesFilter = new KalturaAccessControlFilter();
	    accessControlProfilesFilter.orderBy = '-createdAt';
		const accessControlProfilesPager = new KalturaFilterPager();
	    accessControlProfilesPager.pageSize = 1000;
        return <any>this._kalturaServerClient.request(new AccessControlListAction({
            filter : accessControlProfilesFilter,
	        pager: accessControlProfilesPager
        }));
    }
}
