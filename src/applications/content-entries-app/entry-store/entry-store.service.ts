import { Inject, Injectable, Optional, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Route, Params, NavigationEnd, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { KalturaMediaEntry } from '@kaltura-ng2/kaltura-api/types';
import { KalturaServerClient, KalturaMultiRequest } from '@kaltura-ng2/kaltura-api';
import { BaseEntryGetAction } from '@kaltura-ng2/kaltura-api/services/base-entry';
import { EntrySectionTypes } from './entry-sections-types';
import { EntryLoading, EntryEvents, EntryLoaded, SectionEntered, EntryRemoved } from './entry-sections-events';
import { EntrySectionsManager } from './entry-sections-manager';
import { EntrySectionHandler } from './entry-section-handler';

export type UpdateStatus = {
	loading : boolean;
	errorMessage? : string;
};

@Injectable()
export class EntryStore implements OnInit{

	private _status: BehaviorSubject<UpdateStatus> = new BehaviorSubject<UpdateStatus>({
		loading : false
	});
	private _entryRouteUrl : string = '';
	private _entry: BehaviorSubject<KalturaMediaEntry> = new BehaviorSubject<KalturaMediaEntry>(null);
	private _routeParamsChangedSubscription : ISubscription = null;
	private _routerEventsSubscription : ISubscription = null;
	private _activeSectionType : EntrySectionTypes = null;
	private _draftEntry : KalturaMediaEntry = null;
	private _entrySectionsManager : EntrySectionsManager = null;
	private _events : Subject<EntryEvents> = new Subject<EntryEvents>();

	public entry$ = this._entry.asObservable();
	public status$ = this._status.asObservable();

	public get entry() : KalturaMediaEntry
	{
		return this._entry.getValue();
	}

    constructor(private kalturaServerClient: KalturaServerClient,
				private _router: Router,
				private _entryRoute: ActivatedRoute,
				@Inject(EntrySectionHandler) @Optional() private  _sections : EntrySectionHandler[]) {
    }

	ngOnInit(){

		if (!this._entryRoute.snapshot.data.entryRoute)
		{
			throw new Error("this service can be injected from component that is associated to the entry route");
		}

		this._entrySectionsManager = new EntrySectionsManager(this._events.asObservable(), this._sections);
		this._routeParamsChangedSubscription = this._onParamsChanged();
		this._routerEventsSubscription = this._onRouterEvents();
	}

	ngOnDestory() {
		this._entrySectionsManager.ngOnDestroy();

		this._routeParamsChangedSubscription.unsubscribe();
		this._routerEventsSubscription.unsubscribe();
		this._status.complete();
		this._entry.complete();
		this._events.complete();
	}

	private _onRouterEvents() : ISubscription
	{
		return this._router.events.subscribe(
			event =>
			{
				if (event instanceof NavigationStart)
				{
					//this._events.next({ fromSection : this._activeSection, toSection : });
				}else if (event instanceof NavigationEnd)
				{
					this._updateActiveSection();
				}
			}
		)
	}

	private _updateActiveSection() : void{
		let toSection : EntrySectionTypes = this._entryRoute.firstChild.snapshot.data.sectionType;

		if (toSection !== this._activeSectionType)
		{
			const fromSection = this._activeSectionType;
			this._activeSectionType = toSection;
			this._events.next(new SectionEntered(fromSection, toSection));
		}
	}

	private _onParamsChanged() : ISubscription
	{
		return this._entryRoute.params
        .do((params : Params) =>
		{
			this._status.next({loading: true, errorMessage: null});

			this._draftEntry = null;
			this._events.next(new EntryRemoved());
		})
        .switchMap((params: Params) => this._getEntry(params['id']))
        .subscribe((response) =>
			{
				if (response instanceof KalturaMediaEntry)
				{
					this._status.next({loading: false, errorMessage: null});

					// TODO [kmcng] handle situations when the subscribers has errors!!

					this._draftEntry = response;

					this._entry.next(this._draftEntry);
					this._events.next(new EntryLoaded(this._draftEntry));
				}else
				{
					// handle error
					const errorMessage = response.message || 'Failed to load entry';
					this._status.next({loading: false, errorMessage: errorMessage});
				}
			}
		);
	}

    public openSection(sectionType : EntrySectionTypes) : void{
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
			this._router.navigate(navigatePath, {relativeTo: this._entryRoute});
		}
	}




	private _getEntry(entryId:string) : Observable<KalturaMediaEntry | Error>
	{
		if (entryId) {

			return Observable.create(observer => {

				const request = new KalturaMultiRequest(
					new BaseEntryGetAction({entryId})
						.setCompletion(
							response =>
							{
								if (response.result) {
									if (response.result instanceof KalturaMediaEntry) {
										observer.next(response.result);
									}else
									{
										observer.next(new Error("invalid entry type, expected KalturaMediaEntry"));
									}
								}else {
									observer.next(response.error);
								}
							}
						)
				);

				this._events.next(new EntryLoading(entryId, request,  this._activeSectionType));

				const requestSubscription = this.kalturaServerClient.multiRequest(request).subscribe(() =>
				{
					// should not do anything here
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



	public openEntry(entryId : string)
	{
		alert(`open entry ${entryId}`);
	}

	public returnToEntries(params : {force? : boolean} = {})
	{
		this._router.navigate(['content/entries']);
	}
}
