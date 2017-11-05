import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PlaylistStore } from '../playlist-store.service';
import { PlaylistSections } from '../playlist-sections';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { StickyComponent } from '@kaltura-ng/kaltura-ui';

export class SectionData{
	constructor(
	  public id: string,
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

export class PlaylistSectionsList implements OnInit, OnDestroy {
	public _loading = false;
	public sections: SectionData[] = [];

	@ViewChild('playlistSections') private playlistSections: StickyComponent;

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
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          if(response.section !== null) {
            this.sections.forEach(section => section.isActive = false);
            this.sections[response.section].isActive = true;
            this.playlistSections.updateLayout();
          }
        }
      );

    this._playlistStore.sectionsState$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this.sections[PlaylistSections.Metadata].hasErrors = !response.metadata.isValid;
          this.sections[PlaylistSections.Content].hasErrors = !response.content.isValid;
        }
      );
	}

	ngOnDestroy() {}
}
