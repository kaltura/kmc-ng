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
	public numberOfEntries: number;

	constructor( public _playlistStore : PlaylistStore ) {}

	ngOnInit() {
		this._playlistStore.playlist$
      .cancelOnDestroy(this)
			.subscribe(
				response => {
					if(response.playlist) {
						this.playlist = response.playlist;
						this.getNumberOfEntries(this.playlist.playlistContent);
					}
				}
			);
	}

	getNumberOfEntries(playlistContent: string) {
    this.numberOfEntries = 0;
	  if(playlistContent) {
      this.numberOfEntries = playlistContent.indexOf(',') != -1 ? playlistContent.split(',').length : 1;
    }
	}

	ngOnDestroy() {}
}

