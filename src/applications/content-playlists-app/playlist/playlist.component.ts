import { Component, OnInit, OnDestroy } from '@angular/core';
import { BrowserService } from 'kmc-shell';
import {
	AreaBlockerMessage,
	AreaBlockerMessageButton
} from '@kaltura-ng2/kaltura-ui';
import {
	PlaylistStore,
	ActionTypes
} from './playlist-store.service';
import { PlaylistFormManager } from './playlist-form-manager';
import { PlaylistsStore } from '../playlists/playlists-store/playlists-store.service';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';

@Component({
    selector: 'kPlaylist',
    templateUrl: './playlist.component.html',
    styleUrls: ['./playlist.component.scss'],
	providers : [
		PlaylistStore,
		PlaylistFormManager
	]
})
export class PlaylistComponent implements OnInit, OnDestroy {
	_playlistName: string;
	public _showLoader = false;
	public _areaBlockerMessage: AreaBlockerMessage;
	public _currentPlaylistId: string;
	public _enablePrevButton: boolean;
	public _enableNextButton: boolean;
	public _entryHasChanges : boolean;
	public isSafari: boolean = false;

	constructor(
		private _browserService: BrowserService,
		private _playlistStore: PlaylistStore,
		private  _playlistsStore: PlaylistsStore,
		private _appLocalization: AppLocalization
	) {}

	ngOnInit() {
		this.isSafari = this._browserService.isSafari();

		this._playlistStore.state$
			.cancelOnDestroy(this)
			.subscribe(
				status => {

					this._showLoader = false;
					this._areaBlockerMessage = null;

					if (status) {
						switch (status.action) {
							case ActionTypes.PlaylistLoading:
								this._showLoader = true;

								// when loading new playlist in progress, the 'playlistID' property
								// reflect the playlist that is currently being loaded
								// while 'playlist$' stream is null
								this._currentPlaylistId = this._playlistStore.playlistId;
								this._updateNavigationState();
								this._entryHasChanges = false;
								break;
							case ActionTypes.PlaylistLoaded:
								this._playlistName = this._playlistStore.playlist.name;
								break;
							case ActionTypes.PlaylistLoadingFailed:
								let message = status.error ? status.error.message : '';
								message = message || this._appLocalization.get('applications.content.errors.loadError');
								this._areaBlockerMessage = new AreaBlockerMessage({
									message: message,
									buttons: [
										this._createBackToPlaylistsButton(),
										{
											label: this._appLocalization.get('applications.content.entryDetails.errors.retry'),
											action: () => {
												this._playlistStore.reloadEntry();
											}
										}
									]
								});
								break;
							case ActionTypes.NavigateOut:
								this._showLoader = true;
								break;
							default:
								break;
						}
					}
				},
				error => {
					// TODO [kmc] navigate to error page
					throw error;
				});
	}

	public _backToList(){
		this._playlistStore.returnToPlaylists();
	}

	private _createBackToPlaylistsButton(): AreaBlockerMessageButton {
		return {
			label: 'Back To Playlists',
			action: () => {
				this._playlistStore.returnToPlaylists();
			}
		};
	}

	private _updateNavigationState() {
		const playlists = this._playlistsStore.playlists;
		if (playlists && this._currentPlaylistId) {
			const currentPlaylist = playlists.find(playlist => playlist.id === this._currentPlaylistId);
			const currentPlaylistIndex = currentPlaylist ? playlists.indexOf(currentPlaylist) : -1;
			this._enableNextButton = currentPlaylistIndex >= 0 && (currentPlaylistIndex < playlists.length - 1);
			this._enablePrevButton = currentPlaylistIndex > 0;

		} else {
			this._enableNextButton = false;
			this._enablePrevButton = false;
		}
	}

	ngOnDestroy() {}
}
