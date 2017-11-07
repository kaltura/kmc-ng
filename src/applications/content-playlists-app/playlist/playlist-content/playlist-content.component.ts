import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlaylistStore } from '../playlist-store.service';
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
  public _selectedEntries: KalturaMediaEntry[] = [];

  constructor(public _playlistStore: PlaylistStore,
              public _widgetService: PlaylistContentWidget,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
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

  public _deleteEntries(selectedEntries: KalturaMediaEntry[]) {
    const entriesToDelete = selectedEntries.map((entry, index) => `${index + 1}: ${entry.name}`);
    const entries = selectedEntries.length <= 10 ? entriesToDelete.join(',').replace(/,/gi, '<br />') + '<br />' : '';
    const plural = selectedEntries.length > 1;
    const header = this._appLocalization.get(`applications.content.playlists.${plural ? 'deleteEntries' : 'deleteEntry'}`);
    const message = `
      ${this._appLocalization.get('applications.content.playlists.' + plural ? 'confirmDeleteEntries' : 'confirmDeleteEntry')}\n
      ${entries}
      ${this._appLocalization.get('applications.content.entries.' + plural ? 'deleteEntriesNote' : 'deleteEntryNote')}
    `;
    this._browserService.confirm(
      {
        header,
        message,
        accept: () => {
          setTimeout(() => {
            this._widgetService.deleteSelectedEntries(selectedEntries);
            this._clearSelection();
          }, 0);
        }
      }
    );
  }

  public _onActionSelected(event: { action: string, entry: KalturaMediaEntry }): void {
    this._clearSelection();
    this._widgetService.onActionSelected(event);
  }
}

