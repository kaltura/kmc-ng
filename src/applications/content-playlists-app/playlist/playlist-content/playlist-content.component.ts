import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PlaylistStore } from '../playlist-store.service';
import { PlaylistEntriesTableComponent } from './playlist-entries-table/playlist-entries-table.component';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { PlaylistContentWidget } from './playlist-content-widget.service';

@Component({
  selector: 'kPlaylistContent',
  templateUrl: './playlist-content.component.html',
  styleUrls: ['./playlist-content.component.scss'],
})
export class PlaylistContentComponent implements OnInit, OnDestroy {
  @ViewChild(PlaylistEntriesTableComponent) private dataTable: PlaylistEntriesTableComponent;

  public _selectedEntries: KalturaMediaEntry[] = [];

  constructor(public _playlistStore: PlaylistStore, public _widgetService: PlaylistContentWidget) {
  }

  ngOnInit() {
    this._widgetService.attachForm();
    this.dataTable.scrollToTop();
  };

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  public _clearSelection() {
    this._selectedEntries = [];
  }
}

