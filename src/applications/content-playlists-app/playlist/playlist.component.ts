import { Component, OnInit, OnDestroy } from '@angular/core';
import { BrowserService } from 'app-shared/kmc-shell';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { ActivatedRoute } from '@angular/router';
import { PlaylistStore } from './playlist-store.service';

@Component({
    selector: 'kPlaylist',
    templateUrl: './playlist.component.html',
    styleUrls: ['./playlist.component.scss'],
	providers : [PlaylistStore]
})
export class PlaylistComponent implements OnInit, OnDestroy {
	playlistName: string;
	public _showLoader = false;
	public isSafari: boolean = false;
	public _areaBlockerMessage = null;

	constructor(
		private _browserService: BrowserService,
		private _playlistStore: PlaylistStore
	) {}

	ngOnInit() {
		this._playlistStore.state$
			.subscribe(
				response => {
					this._showLoader = response.isBusy;
				}
			);
		this._playlistStore.playlist$
			.subscribe(
				response => {
					if(response.playlist) {
						this.playlistName = response.playlist.name;
					}
				}
			);

		this.isSafari = this._browserService.isSafari();
	}

	public _backToList(){
		this._playlistStore.returnToPlaylists();
	}

	ngOnDestroy() {}
}
