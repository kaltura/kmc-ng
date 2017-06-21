import { Injectable, OnDestroy, Host } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ISubscription } from 'rxjs/Subscription';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { PlaylistGetAction } from 'kaltura-typescript-client/types/PlaylistGetAction';
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';
import { PlaylistFormManager } from './playlist-form-manager';

export enum ActionTypes
{
	PlaylistLoading,
	PlaylistLoaded,
	PlaylistLoadingFailed,
	NavigateOut
}

declare type StatusArgs =
	{
		action : ActionTypes;
		error? : Error;
	}

@Injectable()
export class PlaylistStore implements OnDestroy {
	private _loadPlaylistSubscription : ISubscription;
	private _playlist : BehaviorSubject<KalturaPlaylist> = new BehaviorSubject<KalturaPlaylist>(null);
	private _state : Subject<StatusArgs> = new Subject<StatusArgs>();
	public state$ = this._state.asObservable();
	private _playlistId: string;

	public get playlistId() : string{
		return this._playlistId;
	}

	public get playlist() : KalturaPlaylist
	{
		return this._playlist.getValue();
	}

    constructor(
		private _router: Router,
		private _playlistRoute: ActivatedRoute,
		private _kalturaServerClient: KalturaClient,
		@Host() private _sectionsManager : PlaylistFormManager,
	) {
		this._sectionsManager.playlistStore = this;

		this._onRouterEvents();
	}

	private _canLeaveWithoutSaving() : Observable<{ allowed : boolean}>
	{
		return Observable.create(observer =>
		{
			observer.next({allowed: true});
			observer.complete();
		}).monitor('playlist store: check if can leave section without saving');
	}

	ngOnDestroy() {
		this._loadPlaylistSubscription && this._loadPlaylistSubscription.unsubscribe();
		this._state.complete();
		this._playlist.complete();
	}

	public returnToPlaylists(params : {force? : boolean} = {})
	{
		this._canLeaveWithoutSaving()
            .cancelOnDestroy(this)
			.monitor('playlist store: return to playlists list')
			.subscribe(
				response =>
				{
					if (response.allowed)
					{
						this._state.next({action: ActionTypes.NavigateOut});

						this._router.navigate(['content/playlists']);
					}
				}
			);
	}

	public reloadEntry() : void
	{
		if (this.playlistId)
		{
			this._loadPlaylist(this.playlistId);
		}
	}

	private _onRouterEvents() : void {
		this._router.events
			.cancelOnDestroy(this)
			.subscribe(
				event => {
					if (event instanceof NavigationEnd) {
						const currentPlaylistId = this._playlistRoute.snapshot.params.id;
						const playlist = this._playlist.getValue();
						if (!playlist || (playlist && playlist.id !== currentPlaylistId)) {
							this._loadPlaylist(currentPlaylistId);
						}
					}
				}
			)
	}

	private _getPlaylist(id:string) : Observable<KalturaPlaylist | Error> {
		if (id) {
			return Observable.create(observer => {
				try {
					const request = new KalturaMultiRequest (
						new PlaylistGetAction({id})
							.setCompletion(
								response =>
								{
									if (response.result) {
										if (response.result instanceof KalturaPlaylist) {
											observer.next(response.result);
											observer.complete();
										}else
										{
											observer.next(new Error("invalid entry type, expected KalturaPlaylist"));
											observer.complete();
										}
									} else {
										observer.next(response.error);
									}
								}
							)
					);

					const requestSubscription = this._kalturaServerClient.multiRequest(request).subscribe(() =>
					{

					});

					return () =>
					{
						if (requestSubscription)
						{
							requestSubscription.unsubscribe();
						}
					}
				} catch(ex) {
					observer.next(ex);
				}
			});
		} else {
			return Observable.of(new Error('missing playlist id'));
		}
	}


	private _loadPlaylist(playlistId : string) : void {
		if (this._loadPlaylistSubscription) {
			this._loadPlaylistSubscription.unsubscribe();
			this._loadPlaylistSubscription = null;
		}

		this._playlistId = playlistId;

		this._state.next({action: ActionTypes.PlaylistLoading});
		this._sectionsManager.onDataLoading(playlistId);
		this._loadPlaylistSubscription = this._getPlaylist(playlistId)
			.cancelOnDestroy(this)
			.subscribe(
				response => {
					if (response instanceof KalturaPlaylist) {

						this._playlist.next(response);
						this._playlistId = response.id;

						const dataLoadedResult = this._sectionsManager.onDataLoaded(response);

						if (dataLoadedResult.errors.length)
						{
							this._state.next({action: ActionTypes.PlaylistLoadingFailed,
								error: new Error(`one of the widgets failed while handling data loaded event`)});
						} else {
							this._state.next({action: ActionTypes.PlaylistLoaded});
						}

					} else {
						this._state.next({
							action: ActionTypes.PlaylistLoadingFailed,
							error: new Error(`entry type not supported ${response.name}`)
						});
					}
				},
				error => {
					this._state.next({action: ActionTypes.PlaylistLoadingFailed, error});
				}
			);
	}
}
