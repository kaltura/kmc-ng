import { Component, OnInit } from '@angular/core';
import { PlaylistStore } from '../playlist-store.service';
import { PlaylistSections } from '../playlist-sections';
import { ActivatedRoute } from "@angular/router";
import { AppLocalization } from '@kaltura-ng/kaltura-common';

export class SectionData{
	constructor(public id: PlaylistSections, public name: string, public isActive: boolean = false, public hasErrors: boolean = false){}
}

@Component({
  selector: 'kPlaylistSectionsList',
  templateUrl: './playlist-sections-list.component.html',
  styleUrls: ['./playlist-sections-list.component.scss']
})

export class PlaylistSectionsList implements OnInit {
	public _loading = false;
	public sections: SectionData[] = [];

    constructor(
    	public _appLocalization: AppLocalization,
    	public _playlistStore : PlaylistStore,
		private _playlistRoute: ActivatedRoute
	) {}

	navigateToSection(section: SectionData) {
		this._playlistStore.navigateToSection(section.id);
	}

    ngOnInit() {
		this.sections = [
			new SectionData(PlaylistSections.Metadata, this._appLocalization.get('applications.content.playlistDetails.sections.metadata')),
			new SectionData(PlaylistSections.Content, this._appLocalization.get('applications.content.playlistDetails.sections.content'))
		];
	}
}
