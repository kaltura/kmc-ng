import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { KalturaBaseEntry } from '@kaltura-ng2/kaltura-api/types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { BaseEntryGetAction } from '@kaltura-ng2/kaltura-api/services/base-entry';

export type UpdateStatus = {
	loading : boolean;
	errorMessage : string;
};

@Injectable()
export class EntryStore {

	private _status: BehaviorSubject<UpdateStatus> = new BehaviorSubject<UpdateStatus>({
		loading: false,
		errorMessage: null
	});
	public status$ = this._status.asObservable();

    constructor(private kalturaServerClient: KalturaServerClient) {
    }


	public getEntry(entryId:string) : Observable<{ error : {}, entry : KalturaBaseEntry}>
	{
		if (entryId) {

			return Observable.create(observer => {
				this._status.next({loading: true, errorMessage: null});
				const requestSubscription = this.kalturaServerClient.request(
					new BaseEntryGetAction({entryId})
				).subscribe(entry =>
					{
						this._status.next({loading: false, errorMessage: null});
						observer.next({entry});
					},
					err =>
					{
						this._status.next({loading: false, errorMessage: err});
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
