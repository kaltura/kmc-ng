import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ConnectableObservable } from 'rxjs/observable/ConnectableObservable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/multicast';

import { KalturaBaseEntry } from '@kaltura-ng2/kaltura-api/types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { BaseEntryGetAction } from '@kaltura-ng2/kaltura-api/services/base-entry';


@Injectable()
export class EntryStore {

    constructor(private kalturaServerClient: KalturaServerClient) {
    }


	public getEntry(entryId:string) : Observable<{ error : {}, entry : KalturaBaseEntry}>
	{
		if (entryId) {
			return Observable.create(observer => {

				const requestSubscription = this.kalturaServerClient.request(
					new BaseEntryGetAction({entryId})
				).subscribe(entry =>
					{
						observer.next({entry});
					},
					err =>
					{
						observer.error(err);
						observer.complete();
					});


				return () =>
				{
					if (requestSubscription)
					{
						requestSubscription.unsubscribe();
						requestSubscription;
					}
				}
			});
		}else
		{
			return Observable.of({error : null, entry : null});
		}
	}
}
