import { Injectable,  OnDestroy, Host } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/subscribeOn';
import 'rxjs/add/operator/switchMap';

import { KalturaMediaEntry } from '@kaltura-ng2/kaltura-api/types';
import { KalturaServerClient, KalturaMultiRequest } from '@kaltura-ng2/kaltura-api';
import { BaseEntryGetAction } from '@kaltura-ng2/kaltura-api/services/base-entry';
import { EntrySectionTypes } from './entry-sections-types';
import { EntriesStore } from '../entries-store/entries-store.service';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { EntrySectionsManager } from './entry-sections-manager';

export enum ActionTypes
{
	EntryLoading,
	EntryLoaded,
	EntryLoadingFailed,
	EntrySaving,
	EntrySaved,
	EntrySavingFailed,
	NavigateOut
}

declare type StatusArgs =
{
	action : ActionTypes;
	error? : Error;

}
@Injectable()
export class EntryStore implements  OnDestroy {

	private _loadEntrySubscription : ISubscription;
	private _sectionToRouteMapping : { [key : number] : string} = {};
	private _activeSectionType : EntrySectionTypes = null;
	private _status : Subject<StatusArgs> = new Subject<StatusArgs>();
	public status$ = this._status.monitor('entry store status');


	private _saveEntryInvoked = false;
	private _entry : BehaviorSubject<KalturaMediaEntry> = new BehaviorSubject<KalturaMediaEntry>(null);
	public entry$ = this._entry.monitor("loaded entry");
	private _entryId : string;

	public get entryId() : string{
		return this._entryId;
	}
	public get entry() : KalturaMediaEntry
	{
		return this._entry.getValue();
	}

    constructor(private kalturaServerClient: KalturaServerClient,
				private _router: Router,
				private _entriesStore : EntriesStore,
				@Host() private _sectionsManager : EntrySectionsManager,
				private _entryRoute: ActivatedRoute) {

		this._mapSections();

		this._onRouterEvents();
    }

	ngOnDestroy() {
		this._loadEntrySubscription && this._loadEntrySubscription.unsubscribe();
		this._status.complete();
		this._entry.complete();
	}

	private _mapSections() : void{
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
				}else if (event instanceof NavigationEnd)
				{
					const currentEntryId =this._entryRoute.snapshot.params.id;
					const entry = this._entry.getValue();
					if (!entry || (entry && entry.id !== currentEntryId))
					{
						this._loadEntry(currentEntryId);
					}

					this._updateActiveSection();
				}
			}
		)
	}

	public saveEntry() : void {
		this._saveEntryInvoked = true;

		this._status.next({ action: ActionTypes.EntrySaving});

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
						this._status.next({ action: ActionTypes.EntrySaved});
					} else {
						this._status.next({ action: ActionTypes.EntrySavingFailed});
					}
				}
			);
	}



	private _updateActiveSection() : void{
		let toSection : EntrySectionTypes = this._entryRoute.firstChild.snapshot.data.sectionType;

		if (toSection !== this._activeSectionType)
		{
			this._activeSectionType = toSection;
			this._sectionsManager.onSectionActivated(toSection);
		}
	}

	private _loadEntry(entryId : string) : void {
		if (this._loadEntrySubscription) {
			this._loadEntrySubscription.unsubscribe();
			this._loadEntrySubscription = null;
		}

		this._entryId = entryId;
		this._status.next({action: ActionTypes.EntryLoading});
		this._sectionsManager.onDataLoading(entryId);

		this._loadEntrySubscription = this._getEntry(entryId)
            .subscribe(
				response => {
					if (response instanceof KalturaMediaEntry) {

						this._status.next({ action : ActionTypes.EntryLoaded });
						this._sectionsManager.onDataLoaded(response);
						this._entry.next(response);
					} else {
						this._status.next({
							action: ActionTypes.EntryLoadingFailed,
							error: new Error(`entry type not supported ${response.name}`)
						});
					}
				},
				error => {
					this._status.next({action: ActionTypes.EntryLoadingFailed, error});

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

		this._status.next({action: ActionTypes.NavigateOut});

		this._router.navigate(['content/entries']);
	}
}
