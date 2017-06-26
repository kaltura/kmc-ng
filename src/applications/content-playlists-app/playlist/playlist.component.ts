import { Component, OnInit, OnDestroy } from '@angular/core';
import { BrowserService } from 'app-shared/kmc-shell';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { ActivatedRoute } from '@angular/router';
import { PlaylistStore } from './playlist-store.service';

@Component({
    selector: 'kPlaylist',
    templateUrl: './playlist.component.html',
    styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit, OnDestroy {
	public _showLoader = false;
	public _areaBlockerMessage: AreaBlockerMessage;
	public isSafari: boolean = false;
	_playlistId: number;
	private sub: any;

	constructor(
		private _browserService: BrowserService,
		private route: ActivatedRoute,
		private _playlistStore: PlaylistStore
	) {}

	ngOnInit() {
		this.isSafari = this._browserService.isSafari();

		this.sub = this.route.params
			.subscribe(param => {
			this._playlistId = param.id;
		});
	}

	public _backToList(){
		this._playlistStore.returnToPlaylists();
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}
}

