import { Injectable, OnDestroy } from '@angular/core';
import { KalturaUtils } from 'kaltura-typescript-client/utils/kaltura-utils';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { Scheduler } from 'rxjs';
import { KalturaClient } from '@kaltura-ng/kaltura-client';

import { PlaylistListAction } from 'kaltura-typescript-client/types/PlaylistListAction';
import { KalturaPlaylistListResponse } from 'kaltura-typescript-client/types/KalturaPlaylistListResponse';
import { KalturaPlaylistFilter } from 'kaltura-typescript-client/types/KalturaPlaylistFilter';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaDetachedResponseProfile } from 'kaltura-typescript-client/types/KalturaDetachedResponseProfile';
import { KalturaResponseProfileType } from 'kaltura-typescript-client/types/KalturaResponseProfileType';
import { PlaylistDeleteAction } from 'kaltura-typescript-client/types/PlaylistDeleteAction';

import 'rxjs/add/operator/subscribeOn';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';

export enum SortDirection {
	Desc,
	Asc
}

export interface QueryData
{
	pageIndex : number,
	pageSize : number,
	sortBy : string,
	sortDirection : SortDirection,
	freeText : string,
	createdBefore : Date,
	createdAfter : Date
}

export interface PlaylistData {
  name: string;
  description?: string;
}


@Injectable()
export class PlaylistsStore implements OnDestroy {
	private _playlistsSource  = new BehaviorSubject<{items: KalturaPlaylist[], totalCount: number}>({items: [], totalCount: 0});
	private _stateSource = new BehaviorSubject<{loading : boolean, errorMessage : string}>({ loading : false, errorMessage : null});
	private _querySource = new BehaviorSubject<QueryData>({
		pageIndex: 1,
		pageSize: 50,
		sortBy: 'createdAt',
		sortDirection: SortDirection.Desc,
		freeText : '',
		createdBefore : null,
		createdAfter : null
	});
	private requestSubscription : ISubscription = null;

	public playlists$ = this._playlistsSource.asObservable();
	public state$ = this._stateSource.asObservable();
	public query$ = this._querySource.monitor('queryData update');
	private _newPlaylistData: PlaylistData = null;

  constructor(
		private kalturaServerClient: KalturaClient,
		private browserService: BrowserService,
    public _kalturaServerClient: KalturaClient
	) {
		const defaultPageSize = this.browserService.getFromLocalStorage("playlists.list.pageSize");
		if (defaultPageSize !== null) {
			this._updateQueryData({
				pageSize: defaultPageSize
			});
		}
	}

	private _updateQueryData(partialData : Partial<QueryData>) : void
	{
		const newQueryData =Object.assign({}, this._querySource.getValue(), partialData);
		this._querySource.next(newQueryData);

		if (partialData.pageSize)
		{
			this.browserService.setInLocalStorage("playlists.list.pageSize", partialData.pageSize);
		}
	}

  public get playlists() : KalturaPlaylist[]
  {
    return this._playlistsSource.getValue().items;
  }

  public setNewPlaylistData(newPlaylistData: PlaylistData) {
    this._newPlaylistData = newPlaylistData;
  }

  public getNewPlaylistData(): PlaylistData {
    return this._newPlaylistData;
  }

  public clearNewPlaylistData():void {
    this._newPlaylistData = null
  }

	ngOnDestroy() {
		this._stateSource.complete();
		this._querySource.complete();
		this._playlistsSource.complete();

		if(this.requestSubscription) {
			this.requestSubscription.unsubscribe();
		}
	}

	public reload(force : boolean) : void;
	public reload(query : Partial<QueryData>) : void;
	public reload(query : boolean | Partial<QueryData>) : void {
		const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));

		if (forceReload || this._playlistsSource.getValue().totalCount === 0) {
			if (typeof query === 'object') {
				this._updateQueryData(query);
			}
			this._executeQuery();
		}
	}

	private _executeQuery()
	{
		// cancel previous requests
		if (this.requestSubscription)
		{
			this.requestSubscription.unsubscribe();
			this.requestSubscription = null;
		}

		this._stateSource.next({loading: true, errorMessage: null});

		// execute the request
		this.requestSubscription = this.buildQueryRequest(this._querySource.getValue())
			.subscribeOn(Scheduler.async) // using async scheduler go allow calling this function multiple times in the same event loop cycle before invoking the logic.
			.monitor('playlists store: get playlists()')
			.subscribe(
				response => {
					this.requestSubscription = null;

					this._stateSource.next({loading: false, errorMessage: null});

					this._playlistsSource.next({
						items: <any[]>response.objects,
						totalCount: <number>response.totalCount
					});
				},
				error => {
					this.requestSubscription = null;
					const errorMessage = error & error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
                	this._stateSource.next({loading: false, errorMessage});
				});

	}

	private buildQueryRequest(queryData : QueryData) : Observable<KalturaPlaylistListResponse> {
		try {
			let filter: KalturaPlaylistFilter = new KalturaPlaylistFilter({});

			if (queryData.freeText)
			{
				filter.freeText = queryData.freeText;
			}

			if (queryData.createdBefore)
			{
				filter.createdAtLessThanOrEqual = KalturaUtils.getEndDateValue(queryData.createdBefore);
			}

			if (queryData.createdAfter)
			{
				filter.createdAtGreaterThanOrEqual = KalturaUtils.getStartDateValue(queryData.createdAfter);
			}

			let responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
				type: KalturaResponseProfileType.includeFields,
				fields: 'id,name,createdAt,playlistType'
			});


			// update the sort by args
			if (queryData.sortBy) {
				filter.orderBy = `${queryData.sortDirection === SortDirection.Desc ? '-' : '+'}${queryData.sortBy}`;
			}

			// update pagination args
			let pagination: KalturaFilterPager = null;

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
				new PlaylistListAction({
					filter: filter,
					pager: pagination,
					responseProfile: responseProfile
				})
			);
		} catch(err) {
			return Observable.throw(err);
		}
	}

  public deletePlaylist(id: string) {
    return Observable.create(observer => {
      let subscription: ISubscription;
      subscription = this._kalturaServerClient.request(new PlaylistDeleteAction({id})).subscribe(
        () => {
          observer.next();
          observer.complete();
        },
        error =>{
          observer.error(error);
        }
      );
      return ()=>{
        if (subscription) {
          subscription.unsubscribe();
        }
      }
    });
  }
}

