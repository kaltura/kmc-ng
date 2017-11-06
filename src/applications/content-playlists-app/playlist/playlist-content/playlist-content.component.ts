import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PlaylistStore } from '../playlist-store.service';
import { PlaylistEntriesTableComponent } from './playlist-entries-table/playlist-entries-table.component';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { PlaylistContentWidget } from './playlist-content-widget.service';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kPlaylistContent',
  templateUrl: './playlist-content.component.html',
  styleUrls: ['./playlist-content.component.scss'],
})
export class PlaylistContentComponent implements OnInit, OnDestroy {
  @ViewChild(PlaylistEntriesTableComponent) private dataTable: PlaylistEntriesTableComponent;

  public _selectedEntries: KalturaMediaEntry[] = [];

  constructor(public _playlistStore: PlaylistStore,
              public _widgetService: PlaylistContentWidget,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
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

  public _deleteEntries(selectedEntries: KalturaMediaEntry[]) {
    const entriesToDelete = selectedEntries.map((entry, index) => `${index + 1}: ${entry.name}`);
    const entries = selectedEntries.length <= 10 ? entriesToDelete.join(',').replace(/,/gi, '<br />') + '<br />' : '';
    this._browserService.confirm(
      {
        header: this._appLocalization.get('applications.content.entries.deleteEntries', { 0: selectedEntries.length > 1 ? 'ies' : 'y' }),
        message: `
              ${this._appLocalization.get('applications.content.entries.confirmDeleteEntries', { 0: selectedEntries.length > 1 ? 'ies' : 'y' })}<br/>
              ${entries}
              ${this._appLocalization.get('applications.content.entries.deleteEntriesNote', {
          0: selectedEntries.length > 1 ? 'these' : 'this',
          1: selectedEntries.length > 1 ? 'ies' : 'y'
        })}
        `,
        accept: () => {
          setTimeout(() => {
            this._widgetService.deleteSelectedEntries(selectedEntries);
            this._clearSelection();
          }, 0);
        }
      }
    );
  }
}

