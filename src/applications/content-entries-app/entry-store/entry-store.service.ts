import { Injectable,  OnDestroy, Host } from '@angular/core';
import { ActivatedRoute, Router,  Params, NavigationEnd, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Scheduler } from 'rxjs';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/subscribeOn';
import 'rxjs/add/operator/switchMap';

import { KalturaMediaEntry } from '@kaltura-ng2/kaltura-api/types';
import { KalturaServerClient, KalturaMultiRequest } from '@kaltura-ng2/kaltura-api';
import { BaseEntryGetAction } from '@kaltura-ng2/kaltura-api/services/base-entry';
import { EntrySectionTypes } from './entry-sections-types';
import {
	EntryLoading, EntryEvents, EntryLoaded, SectionEntered,
	EntryLoadingFailed,  EntrySaving, EntrySaved, EntrySavingFailure
} from './entry-sections-events';
import { EntriesStore } from '../entries-store/entries-store.service';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { FormSectionsManager } from './form-sections-manager';


@Injectable()
export class EntryStore implements  OnDestroy{

	private _sectionToRouteMapping : { [key : number] : string} = {};
	private _activeSectionType : EntrySectionTypes = null;
	private _events : Subject<EntryEvents> = new Subject<EntryEvents>();

	private _saveEntryInvoked = false;
	private _entry : KalturaMediaEntry = null;
	public events$ = this._events.monitor('entry event').share();



	public get entry() : KalturaMediaEntry
	{
		return this._entry;
	}

    constructor(private kalturaServerClient: KalturaServerClient,
				private _router: Router,
				private _entriesStore : EntriesStore,
				@Host() private _sectionsManager : FormSectionsManager,
				private _entryRoute: ActivatedRoute) {

		this._sectionsManager.setStore(this);

		this._initializeSections();

		this._onParamsChanged();
		this._onRouterEvents();
    }

	ngOnDestroy() {
		this._events.complete();
	}



	private _initializeSections() : void{
		if (!this._entryRoute || !this._entryRoute.snapshot.data.entryRoute)
		{
			throw new Error("this service can be injected from component that is associated to the entry route");
		}

		this._entryRoute.snapshot.routeConfig.children.forEach(childRoute =>
		{
			const routeSectionType = childRoute.data ? childRoute.data.sectionType : null;

			if (routeSectionType !== null)
			{
				this._sectionToRouteMapping[routeSectionType] = childRoute.path;
			}
		});
	}
	private _onRouterEvents() : void
	{
		this._router.events
			.cancelOnDestroy(this)
			.subscribe(
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

	public saveEntry() : void {
		this._saveEntryInvoked = true;

		this._events.next(new EntrySaving());

		this._sectionsManager.canSaveData()
            .monitor('saving entry')
            .flatMap(
				(response) => {
					// save entry
					return Observable.of(response)
				}
			)
            .subscribe(
				response => {
					if (response) {
						this._events.next(new EntrySaved());
					} else {
						this._events.next(new EntrySavingFailure(null));
					}
				}
			);
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

	private _onParamsChanged() : void
	{
		this._entryRoute.params.do((params : Params) =>
		{
		})
		.cancelOnDestroy(this)
        .switchMap((params: Params) => this._getEntry(params['id']))
		.subscribeOn(Scheduler.async)
        .subscribe((response) =>
			{
				if (response instanceof KalturaMediaEntry)
				{
					// TODO [kmcng] handle situations when the subscribers has errors!!
					this._events.next(new EntryLoaded(response));
				}else
				{
					// handle error
					const errorMessage = response.message || 'Failed to load entry';
					this._events.next(new EntryLoadingFailed(errorMessage));
				}
			}
		);
	}

    public openSection(sectionType : EntrySectionTypes) : void{
		const navigatePath = this._sectionToRouteMapping[sectionType];

		if (navigatePath) {
			this._router.navigate([navigatePath], {relativeTo: this._entryRoute});
		}
	}

	private _getEntry(entryId:string) : Observable<KalturaMediaEntry | Error>
	{
		if (entryId) {
			return Observable.create(observer => {

				try {
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

					this._events.next(new EntryLoading(entryId, request));

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
				}catch(ex)
				{
					observer.next(ex);
				}
			});
		}else
		{
			return Observable.of(new Error('missing entry id'));
		}
	}

	public openEntry(entryId : string)
	{
		this._router.navigate(["entry", entryId],{ relativeTo : this._entryRoute.parent});
	}

	public returnToEntries(params : {force? : boolean} = {})
	{
		if (this._saveEntryInvoked)
		{
			this._entriesStore.reload();
			this._saveEntryInvoked = false;
		}
		this._router.navigate(['content/entries']);
	}
}
