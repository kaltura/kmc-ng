import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlaylistStore } from '../playlist-store.service';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { PlaylistContentWidget } from './playlist-content-widget.service';

@Component({
  selector: 'kPlaylistContent',
  templateUrl: './playlist-content.component.html',
  styleUrls: ['./playlist-content.component.scss'],
})
export class PlaylistContentComponent implements OnInit, OnDestroy {
  public _selectedEntries: KalturaMediaEntry[] = [];

  constructor(public _playlistStore: PlaylistStore,
              public _widgetService: PlaylistContentWidget) {
  }

  ngOnInit() {
    this._widgetService.attachForm();
  };

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  public _clearSelection() {
    this._selectedEntries = [];
  }

  public _onActionSelected(event: { action: string, entry: KalturaMediaEntry }): void {
    this._clearSelection();
    this._widgetService.onActionSelected(event);
  }

  public _onSortChanged(event: { field: string, order: -1 | 1, multisortmeta: any }): void {
    this._clearSelection();
    this._widgetService.onSortChanged(event);
  }
}

