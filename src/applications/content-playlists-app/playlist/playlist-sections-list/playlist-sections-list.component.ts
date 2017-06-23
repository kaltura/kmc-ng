import { Component, OnInit } from '@angular/core';
import { PlaylistStore } from '../playlist-store.service';

export interface Sections {
	metadataIsValid: boolean,
	contentIsValid: boolean
}

@Component({
  selector: 'kPlaylistSectionsList',
  templateUrl: './playlist-sections-list.component.html',
  styleUrls: ['./playlist-sections-list.component.scss']
})

export class PlaylistSectionsList implements OnInit {
	public _loading = false;
	public _activeSelection: number = this._playlistStore.activeSection;
	public sections: Sections;

    constructor( public _playlistStore : PlaylistStore ) {}

	navigateToSection(section: number) {
		this._playlistStore.navigateToSection(section);
		this._activeSelection = this._playlistStore.activeSection;
	}

    ngOnInit() {
		this._playlistStore.sectionsState$
			.subscribe(
				sections => {
					this.sections = sections;
				}
			)
	}
}

