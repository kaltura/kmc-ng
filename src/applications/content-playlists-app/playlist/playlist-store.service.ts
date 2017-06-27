import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ISubscription } from 'rxjs/Subscription';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { PlaylistGetAction } from 'kaltura-typescript-client/types/PlaylistGetAction';
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';
import { AreaBlockerMessageButton } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PlaylistSections } from './playlist-sections';

@Injectable()
export class PlaylistStore implements OnDestroy {
	public _sectionsState = new BehaviorSubject<{ metadataIsValid: boolean, contentIsValid: boolean }>({
		metadataIsValid: true,
		contentIsValid: true
	});
	private _loadPlaylistSubscription : ISubscription;
	public _activeSection = new BehaviorSubject<{ section: PlaylistSections}>({section: null});
	private _playlist = new BehaviorSubject<{ playlist: KalturaPlaylist}>({playlist: null});
	private _state = new BehaviorSubject<{ isBusy: boolean, error?: { message: string, origin: 'reload' | 'save'}}>({isBusy: false});

	public playlist$ = this._playlist.asObservable();
	public sectionsState$ = this._sectionsState.asObservable();
	public state$ = this._state.asObservable();
	private _playlistId: string;

	public navigateToSection(section: PlaylistSections): void {
		// this._router.navigate([PlaylistSections[section].toLowerCase()], {relativeTo: this._playlistRoute});
		// this._activeSection.next({section: section});
	}

	constructor(
		private _router: Router,
		private _playlistRoute: ActivatedRoute,
		private _kalturaServerClient: KalturaClient,
		private _appLocalization: AppLocalization
	) {
		this._state.next({isBusy: true});
		this._sectionsState.next({metadataIsValid: true, contentIsValid: true});
		this._onRouterEvents();
	}

	private _onRouterEvents() : void {
		this._router.events
			.cancelOnDestroy(this)
			.subscribe(
				event => {
					if (event instanceof NavigationEnd) {
						const currentPlaylistId = this._playlistRoute.snapshot.params.id;
						const playlist = this._playlist.getValue();
						if (!playlist.playlist || (playlist.playlist && playlist.playlist.id !== currentPlaylistId)) {
							this._loadPlaylist(currentPlaylistId);
						}
					}
				}
			)
	}

	private _loadPlaylist(id : string) : void  {
		if (this._loadPlaylistSubscription) {
			this._loadPlaylistSubscription.unsubscribe();
			this._loadPlaylistSubscription = null;
		}

		this._playlistId = id;
		this._state.next({isBusy: true});

		this._loadPlaylistSubscription = this._kalturaServerClient.request(new PlaylistGetAction({id}))
			.cancelOnDestroy(this)
			.subscribe(
				response => {
					if (response instanceof KalturaPlaylist) {
						this._playlist.next({playlist: response});
						this._playlistId = response.id;
						this._state.next({isBusy: false});
					} else {
						this._state.next({
							isBusy: true,
							error: {
								message: this._appLocalization.get('applications.content.playlistDetails.errors.entryTypeNotSupported'),
								origin: 'reload'
							}
						});
					}
				},
				error => {
					this._state.next({
						isBusy: true,
						error: {message: error.message, origin: 'reload'}
					});
					this._createBackToPlaylistsButton(),
						{
							label: this._appLocalization.get('applications.content.playlistDetails.errors.retry'),
							action: () => {
								this.reloadPlaylist();
							}
						}
				}
			);
	}

	private _createBackToPlaylistsButton(): AreaBlockerMessageButton {
		return {
			label: this._appLocalization.get('applications.content.playlistDetails.errors.backToPlaylists'),
			action: () => {
				this.returnToPlaylists();
			}
		};
	}

	public reloadPlaylist() : void
	{
		if (this._playlistId)
		{
			this._loadPlaylist(this._playlistId);
		}
	}

	ngOnDestroy() {
		this._loadPlaylistSubscription && this._loadPlaylistSubscription.unsubscribe();
		this._state.complete();
		this._playlist.complete();
	}

	public returnToPlaylists(params : {force? : boolean} = {}) {
		this._router.navigate(['content/playlists']);
	}
}
