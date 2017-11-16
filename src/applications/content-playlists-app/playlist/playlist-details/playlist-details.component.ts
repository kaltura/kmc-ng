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
	public entriesDuration: number = 0;
  public _currentEntry = { creatorId: 0 }; // TODO [kmcng] check template for this
  public _duration = 0; // TODO [kmcng] check template for this
	constructor( public _playlistStore : PlaylistStore ) {}

	ngOnInit() {
		this._playlistStore.playlist$
      .cancelOnDestroy(this)
			.subscribe(
				response => {
				  this.entriesDuration = 0;
					if(response.playlist) {
						this.playlist = response.playlist;
						this.getNumberOfEntries(this.playlist.playlistContent);
					}
					if(response.entries) {
					  response.entries.forEach(entry => {
              this.entriesDuration += entry.duration;
            });
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

