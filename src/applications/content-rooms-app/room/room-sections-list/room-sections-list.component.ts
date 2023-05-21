import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RoomStore } from '../room-store.service';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { StickyComponent } from '@kaltura-ng/kaltura-ui';
import { RoomSectionsListWidget, SectionWidgetItem } from './room-sections-list-widget.service';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kRoomSectionsList',
  templateUrl: './room-sections-list.component.html',
  styleUrls: ['./room-sections-list.component.scss']
})
export class RoomSectionsList implements OnInit, OnDestroy {
  public _loading = false;
  public _showList = false;
  public _sections: SectionWidgetItem[] = [];

  @ViewChild('roomSections', { static: true }) private roomSections: StickyComponent;

  constructor(public _appLocalization: AppLocalization,
              public _roomStore: RoomStore,
              public _widgetService: RoomSectionsListWidget) {
  }

  ngOnInit() {
    this._loading = true;
    this._widgetService.attachForm();

    this._widgetService.sections$
      .pipe(cancelOnDestroy(this))
      .subscribe(sections => {
        this._loading = false;
        this._sections = sections;
        this._showList = sections && sections.length > 0;
        this.roomSections.updateLayout();
      });
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  public _navigateToSection(widget: SectionWidgetItem): void {
    this._roomStore.openSection(widget.key);
  }

}
