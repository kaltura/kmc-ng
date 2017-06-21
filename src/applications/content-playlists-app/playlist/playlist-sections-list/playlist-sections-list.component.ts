import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { PlaylistFormManager } from '../playlist-form-manager';
import { PlaylistStore } from '../playlist-store.service';

@Component({
  selector: 'kPlaylistSectionsList',
  templateUrl: './playlist-sections-list.component.html',
  styleUrls: ['./playlist-sections-list.component.scss']
})
export class PlaylistSectionsList implements AfterViewInit, OnInit, OnDestroy {
	public _loading = false;
	public _showList = false;

    constructor(
		private _playlistFormManager : PlaylistFormManager,
		public _playlistStore : PlaylistStore
	) {}

    ngOnInit() {
		// this._loading = true;
	}

    ngOnDestroy() {}

    ngAfterViewInit() {}

}

