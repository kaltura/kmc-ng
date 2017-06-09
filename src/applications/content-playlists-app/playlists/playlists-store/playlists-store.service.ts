import { Component, Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { Scheduler } from 'rxjs';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import {
	PlaylistListAction,
	KalturaPlaylistListResponse,
	KalturaPlaylistFilter,
	KalturaFilterPager,
	KalturaDetachedResponseProfile,
	KalturaResponseProfileType,
	KalturaMediaEntry,
	BaseEntryListAction
} from 'kaltura-typescript-client/types/all';
import {
	MetadataProfileStore,
	MetadataProfileTypes,
	MetadataProfileCreateModes,
	AppAuthentication
} from '@kaltura-ng2/kaltura-common';
import 'rxjs/add/operator/subscribeOn';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

import { BrowserService } from "kmc-shell/providers/browser.service";

export type UpdateStatus = {
	loading : boolean;
	errorMessage : string;
};

export enum SortDirection {
	Desc,
	Asc
}

export interface QueryData
{
	pageIndex? : number,
	pageSize? : number,
	sortBy? : string,
	sortDirection? : SortDirection,
	fields? : string,
	metadataProfiles? : number[]
}

export interface QueryRequestArgs {
	data : QueryData;
}

@Injectable()
export class PlaylistsStore implements OnDestroy {
	private _playlists  = new BehaviorSubject({items: [], totalCount: 0});
	private _state = new BehaviorSubject<UpdateStatus>({ loading : false, errorMessage : null});
	private _queryData : QueryData = {
		pageIndex: 1,
		pageSize: 50,
		sortBy: 'createdAt',
		sortDirection: SortDirection.Desc,
		fields: 'id,name,createdAt,playlistType'
	};
	private _querySource = new Subject<QueryRequestArgs>();
	private _metadataProfilesLoaded = false;
	private executeQueryState  : { subscription : ISubscription, deferredRemovedFilters : any[], deferredAddedFilters : any[]} = { subscription : null, deferredAddedFilters : [], deferredRemovedFilters : []};

	public playlists$ = this._playlists.asObservable();
	public state$ = this._state.asObservable();
	public query$ = this._querySource.asObservable();

	constructor(
		private kalturaServerClient: KalturaClient,
		private _appAuthentication: AppAuthentication,
		private browserService: BrowserService,
		private metadataProfileService : MetadataProfileStore
	){
		const defaultPageSize = this.browserService.getFromLocalStorage("playlists.list.pageSize");
		if (defaultPageSize !== null) {
			this._queryData.pageSize = defaultPageSize;
		}

		this._getMetadataProfiles();
	}

	public get queryData() : QueryData{
		return Object.assign({}, this._queryData);
	}

	private _getMetadataProfiles() : Observable<void> {
		if (this._metadataProfilesLoaded) {
			return Observable.of(undefined);
		} else {
			return this.metadataProfileService.get(
				{
					type: MetadataProfileTypes.Entry,
					ignoredCreateMode: MetadataProfileCreateModes.App
				})
				.cancelOnDestroy(this)
				.monitor('playlists store: get metadata profiles')
				.do(
					metadataProfiles => {
						this._queryData.metadataProfiles = metadataProfiles.items.map(metadataProfile => metadataProfile.id);
						this._metadataProfilesLoaded = true;
					}
				).map(() => {
					return undefined;
				});
		}
	}

	ngOnDestroy() {
		{
			if (this.executeQueryState.subscription) {
				this.executeQueryState.subscription.unsubscribe();
				this.executeQueryState.subscription = null;
			}

			this._state.complete();
			this._querySource.complete();
			this._playlists.complete();
		}
	}

	public get playlists() : KalturaMediaEntry[]
	{
		return this._playlists.getValue().items;
	}

	public reload(force : boolean) : void;
	public reload(query : QueryData) : void;
	public reload(query : boolean | QueryData) : void {
		const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));

		if (forceReload || this._playlists.getValue().totalCount === 0) {
			if (typeof query === 'object') {
				Object.assign(this._queryData, query);
			}
			this._executeQuery();
		}
	}

	private _executeQuery()
	{
		// cancel previous requests
		if (this.executeQueryState.subscription)
		{
			this.executeQueryState.subscription.unsubscribe();
			this.executeQueryState.subscription = null;
		}

		this.browserService.setInLocalStorage("playlists.list.pageSize", this._queryData.pageSize);

		// execute the request
		this.executeQueryState.subscription = Observable.create(observer => {

			this._state.next({loading: true, errorMessage: null});

			let requestSubscription = this._getMetadataProfiles()
				.flatMap(
					() =>
					{
						const queryArgs : QueryRequestArgs = Object.assign({},
							{
								addedFilters : this.executeQueryState.deferredAddedFilters || [],
								removedFilters : this.executeQueryState.deferredRemovedFilters || [],
								data : this._queryData
							});

						this._querySource.next(queryArgs);

						this.executeQueryState.deferredAddedFilters = [];
						this.executeQueryState.deferredRemovedFilters = [];

						return this.buildQueryRequest(queryArgs)
							.monitor('playlists store: transmit request',queryArgs);
					}
				).subscribe(observer);


			return () => {
				if (requestSubscription) {
					requestSubscription.unsubscribe();
					requestSubscription = null;
				}
			}
		}).subscribeOn(Scheduler.async) // using async scheduler go allow calling this function multiple times in the same event loop cycle before invoking the logic.
			.monitor('playlists store: get playlists ()')
			.subscribe(
				response => {
					this.executeQueryState.subscription = null;

					this._state.next({loading: false, errorMessage: null});

					this._playlists.next({
						items: <any[]>response.objects,
						totalCount: <number>response.totalCount
					});
				},
				error => {
					this.executeQueryState.subscription = null;
					this._state.next({loading: false, errorMessage: (<Error>error).message || <string>error});
				});

	}

	private buildQueryRequest({data : queryData } : { data : QueryData}) : Observable<KalturaPlaylistListResponse> {
		try {
			let filter: KalturaPlaylistFilter = new KalturaPlaylistFilter({});
			let responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
				type: KalturaResponseProfileType.includeFields,
				fields: this._queryData.fields
			});
			let pagination: KalturaFilterPager = new KalturaFilterPager({
				pageSize: this._queryData.pageSize,
				pageIndex: this._queryData.pageIndex
			});
			const partnerId = this._appAuthentication.appUser.partnerId;

			// update the sort by args
			if (queryData.sortBy) {
				filter.orderBy = `${queryData.sortDirection === SortDirection.Desc ? '-' : '+'}${queryData.sortBy}`;
			}

			// update desired fields of playlists
			if (queryData.fields) {
				responseProfile = new KalturaDetachedResponseProfile({
					type : KalturaResponseProfileType.includeFields,
					fields : queryData.fields
				});

			}

			// update pagination args
			if (queryData.pageIndex || queryData.pageSize) {
				pagination = new KalturaFilterPager(
					{
						pageSize: queryData.pageSize,
						pageIndex: queryData.pageIndex
					}
				);
			}

			// build the request
			return <any>this.kalturaServerClient.request(
				new BaseEntryListAction({
					filter: filter,
					pager: pagination,
					responseProfile: responseProfile
				})
			);

			/*return this._kalturaClient.request(new PlaylistListAction({
				filter: filter,
				pager: pagination,
				partnerId: partnerId,
				responseProfile: responseProfile
			}));*/
		} catch(err) {
			return Observable.throw(err);
		}
	}
}

