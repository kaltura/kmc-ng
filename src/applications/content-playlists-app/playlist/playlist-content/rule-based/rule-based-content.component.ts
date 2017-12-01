import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlaylistStore } from '../../playlist-store.service';
import { PlaylistRule, RuleBasedContentWidget } from './rule-based-content-widget.service';

@Component({
  selector: 'kPlaylistContentRuleBased',
  templateUrl: './rule-based-content.component.html',
  styleUrls: ['./rule-based-content.component.scss'],
})
export class RuleBasedContentComponent implements OnInit, OnDestroy {
  public _selectedRules: PlaylistRule[] = [];

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
    this._selectedRules = [];
  }

  public _onActionSelected(event: { action: string, rule: PlaylistRule }): void {
    this._clearSelection();
    this._widgetService.onActionSelected(event);
  }

  public _onSortChanged(event: { field: string, order: -1 | 1, multisortmeta: any }): void {
    this._clearSelection();
    this._widgetService.onSortChanged(event);
  }

  public _deleteSelected(selectedRules: PlaylistRule[]): void {
    this._clearSelection();
    this._widgetService.deleteSelectedRules(selectedRules);
  }
}

