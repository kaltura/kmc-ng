import { Component, Input, AfterViewInit, OnInit, OnDestroy } from '@angular/core';

@Component({
	selector: 'kPlaylistsTable',
	templateUrl: './playlists-table.component.html',
	styleUrls: ['./playlists-table.component.scss']
})
export class PlaylistsTableComponent implements AfterViewInit {
	private _playlists: any[] = [];
	public _playlistsProvider: any[] = [];
	public _viewLoaded = false;

	@Input() set playlists(data: any[]) {
		this._playlists = data;
		if (this._viewLoaded) {
			// This prevents the screen from hanging during datagrid rendering of the data.
			this._playlistsProvider = this._playlists;
		}
	}

	constructor() {
		this._viewLoaded = false;
	}

	ngAfterViewInit() {
		if (!this._viewLoaded) {
			// use timeout to allow the DOM to render before setting the data to the datagrid. This prevents the screen from hanging during datagrid rendering of the data.
			setTimeout(()=> {
				this._viewLoaded = true;
				this._playlistsProvider = this._playlists;
			}, 0);
		}
	}
}

