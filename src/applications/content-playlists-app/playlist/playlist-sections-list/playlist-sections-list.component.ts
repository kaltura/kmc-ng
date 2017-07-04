import { Component, OnInit } from '@angular/core';
import { PlaylistStore } from '../playlist-store.service';
import { PlaylistSections } from '../playlist-sections';
import { AppLocalization } from '@kaltura-ng/kaltura-common';

export class SectionData{
	constructor(
	  public id: PlaylistSections,
    public name: string,
    public isActive: boolean  = false,
    public hasErrors: boolean = false
  ){}
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
      public _playlistStore : PlaylistStore
	) {}

	navigateToSection(section: SectionData) {
		this._playlistStore.openSection(section.id);
	}

  ngOnInit() {
    this.sections = [
      new SectionData(PlaylistSections.Metadata, this._appLocalization.get('applications.content.playlistDetails.sections.metadata'), false, false),
      new SectionData(PlaylistSections.Content, this._appLocalization.get('applications.content.playlistDetails.sections.content'), false, false)
    ];
    this._playlistStore.activeSection$
      .subscribe(
        response => {
          if(response.section !== null) {
            this.sections.forEach(section => section.isActive = false);
            this.sections[response.section].isActive = true;
          }
        }
      );

    this._playlistStore.sectionsState$
      .subscribe(
        response => {
          this.sections[0].hasErrors = response[0] && response[0].isValid !== null ? !response[0].isValid : this.sections[0].hasErrors;
          this.sections[1].hasErrors = response[1] && response[1].isValid !== null ? !response[1].isValid : this.sections[1].hasErrors;
        }
      );
	}
}
