import { Injectable, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { KalturaBaseEntry } from '@kaltura-ng2/kaltura-api/types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { BaseEntryGetAction } from '@kaltura-ng2/kaltura-api/services/base-entry';
import { EntryLoading, EntryLoaded } from "./entry-events";

export enum EntrySectionTypes
{
	Metadata,
	Users,
	Thumbnails
}

export type UpdateStatus = {
	loading : boolean;
	errorMessage : string;
};

@Injectable()
export class EntryStore implements OnInit{

	private _status: BehaviorSubject<UpdateStatus> = new BehaviorSubject<UpdateStatus>({
		loading: false,
		errorMessage: null
	});
	private _entryLoading: ReplaySubject<EntryLoading> = new ReplaySubject<EntryLoading>(1);
	private _entryLoaded: ReplaySubject<EntryLoaded> = new ReplaySubject<EntryLoaded>(1);
	private _routeParamsChangedSubscription : ISubscription = null;

	public entryLoaded$ = this._entryLoaded.asObservable();
	public entryLoading$ = this._entryLoading.asObservable();
	public status$ = this._status.asObservable();

    constructor(private kalturaServerClient: KalturaServerClient,
				private _router: Router,
				private _route: ActivatedRoute) {

    }

	ngOnInit(){
		this._routeParamsChangedSubscription = this._onParamsChanged();
	}

	ngOnDestory(){
    	if (this._routeParamsChangedSubscription)
		{
			this._routeParamsChangedSubscription.unsubscribe();
		}

		this._status.complete();
		this._entryLoading.complete();
    	this._entryLoaded.complete();
	}

	private _onParamsChanged() : ISubscription
	{
		return this._route.params
        .do((params : Params) =>
		{
			this._status.next({loading: true, errorMessage: null});
			this._entryLoading.next({ entryId : params['id'] })
		})
        .switchMap((params: Params) => this._getEntry(params['id']))
        .subscribe((response) =>
			{
				if (response instanceof KalturaBaseEntry)
				{
					this._status.next({loading: false, errorMessage: null});

					// TODO [kmcng] handle situations when the subscribers has errors!!
					this._entryLoaded.next({ entry : response});
				}else
				{
					// handle error
					const errorMessage = response.message || 'Failed to load entry';
					this._status.next({loading: false, errorMessage: errorMessage});
				}
			}
		);
	}

    public showSection(sectionType : EntrySectionTypes) : void{
    	let navigatePath = null;
    	switch (sectionType)
		{
			case EntrySectionTypes.Metadata:
				navigatePath = ['metadata'];
				break;
			case EntrySectionTypes.Users:
				navigatePath = ['users'];
				break;
			default:
				break;
		}

		if (navigatePath) {
    		let entryBaseRoute = null;
    		for(let length = this._route.pathFromRoot.length,i = length-1;i>=0 && entryBaseRoute == null;i--)
			{
				const routeData : any = this._route.pathFromRoot[i].snapshot.data;
				if (routeData && routeData.entryRootBase)
				{
					entryBaseRoute = this._route.pathFromRoot[i];
				}
			}
			this._router.navigate(navigatePath, {relativeTo: entryBaseRoute});
		}
	}

	private _getEntry(entryId:string) : Observable<KalturaBaseEntry | Error>
	{
		if (entryId) {

			return Observable.create(observer => {
				const requestSubscription = this.kalturaServerClient.request(
					new BaseEntryGetAction({entryId})
				).subscribe(entry =>
					{
						observer.next(entry);
					},
					err =>
					{
						observer.next(err);
					});

				return () =>
				{
					if (requestSubscription)
					{
						requestSubscription.unsubscribe();
					}
				}
			});
		}else
		{
			return Observable.of(new Error('missing entry id'));
		}
	}

	public returnToEntries(params : {force? : boolean} = {})
	{
		this._router.navigate(['content/entries']);
	}
}
