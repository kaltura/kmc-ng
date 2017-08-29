import { Component, AfterViewInit, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PlaylistStore } from '../playlist-store.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kPlaylistContent',
  templateUrl: './playlist-content.component.html',
  styleUrls: ['./playlist-content.component.scss']
})
export class PlaylistContentComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('addEntry') public addEntry: PopupWidgetComponent;

  constructor(public _playlistStore: PlaylistStore) {}

  addNewEntry() {
    this.addEntry.open();
  }

  closePopupWidget() {
    this.addEntry.close();
  }

  ngOnInit() {}

  ngOnDestroy() {}

  ngAfterViewInit() {}

}

