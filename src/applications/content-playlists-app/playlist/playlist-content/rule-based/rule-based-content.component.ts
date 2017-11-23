import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlaylistStore } from '../../playlist-store.service';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { RuleBasedContentWidget } from './rule-based-content-widget.service';

@Component({
  selector: 'kPlaylistContentRuleBased',
  templateUrl: './rule-based-content.component.html',
  styleUrls: ['./rule-based-content.component.scss'],
})
export class RuleBasedContentComponent implements OnInit, OnDestroy {
  public _selectedEntries: KalturaMediaEntry[] = [];

  constructor(public _playlistStore: PlaylistStore,
              public _widgetService: RuleBasedContentWidget) {
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

  public _deleteSelected(selectedEntries: KalturaMediaEntry[]): void {
    this._clearSelection();
    this._widgetService.deleteSelectedEntries(selectedEntries);
  }
}

