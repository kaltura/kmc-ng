import { Component, OnDestroy, OnInit } from '@angular/core';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { SectionWidgetItem, ReachProfileSectionsListWidget } from './reach-profile-sections-list-widget.service';
import { ReachProfileStore } from '../reach-profile-store.service';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kReachProfileSectionsList',
  templateUrl: './reach-profile-sections-list.component.html',
  styleUrls: ['./reach-profile-sections-list.component.scss']
})
export class ReachProfileSectionsListComponent implements OnInit, OnDestroy {

  public _loading = false;
  public _showList = false;
  public _sections: SectionWidgetItem[] = [];

  constructor(public _widgetService: ReachProfileSectionsListWidget,
              public _profileStore: ReachProfileStore,
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

