import { Component, OnInit } from '@angular/core';

import {
	KalturaPlaylistListResponse,
	KalturaPlaylist
} from 'kaltura-typescript-client/types/all';
import { PlaylistsStore } from './playlists-store';

@Component({
    selector: 'kPlaylistsList',
    templateUrl: './playlists-list.component.html',
    styleUrls: ['./playlists-list.component.scss']
})
export class PlaylistsListComponent implements OnInit {
	public playlists: KalturaPlaylist[];
	constructor(public _playlistsStore: PlaylistsStore) {}

	ngOnInit() {
		this._playlistsStore.buildQueryRequest().subscribe(
			(result: KalturaPlaylistListResponse) => {
				this.playlists = result.objects;
			}
		);
	}
}

