import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlaylistStore } from '../playlist-store.service';
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';

@Component({
	selector: 'kPlaylistDetails',
	templateUrl: './playlist-details.component.html',
	styleUrls: ['./playlist-details.component.scss']
})
export class PlaylistDetailsComponent implements OnInit, OnDestroy {
	public playlist: KalturaPlaylist;

	constructor( public _playlistStore : PlaylistStore ) {}

	ngOnInit() {
		this._playlistStore.state$
			.subscribe(
				response => {
					if(!response.isBusy) {
						this.playlist = this._playlistStore.playlist;
					}
				}
			)
	}

	ngOnDestroy() {}
}

