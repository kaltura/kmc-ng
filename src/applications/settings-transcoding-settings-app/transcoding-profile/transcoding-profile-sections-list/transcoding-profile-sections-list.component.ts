import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StickyComponent } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { SectionWidgetItem, TranscodingProfileSectionsListWidget } from './transcoding-profile-sections-list-widget.service';
import { TranscodingProfileStore } from '../transcoding-profile-store.service';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kTranscodingProfileSectionsList',
  templateUrl: './transcoding-profile-sections-list.component.html',
  styleUrls: ['./transcoding-profile-sections-list.component.scss']
})
export class TranscodingProfileSectionsListComponent implements OnInit, OnDestroy {
  @ViewChild('profileSections', { static: true }) private _profileSections: StickyComponent;

  public _loading = false;
  public _showList = false;
  public _sections: SectionWidgetItem[] = [];

  constructor(public _widgetService: TranscodingProfileSectionsListWidget,
              public _profileStore: TranscodingProfileStore,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
    this._loading = true;
    this._widgetService.attachForm();

    this._widgetService.sections$
      .pipe(cancelOnDestroy(this))
      .subscribe(
        sections => {
          this._loading = false;
          this._sections = sections;
          this._showList = sections && sections.length > 0;
          this._profileSections.updateLayout();
        }
      );
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  public _navigateToSection(widget: SectionWidgetItem): void {
    this._browserService.scrollToTop();
    this._profileStore.openSection(widget.key);
  }


}

