import { Component, EventEmitter, Output } from '@angular/core';
import { KalturaMediaEntry } from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaEntryStatus } from 'kaltura-ngx-client';
import { EntriesFilters } from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { ColumnsResizeManagerService, ResizableColumnsTableName } from 'app-shared/kmc-shared/columns-resize-manager';

@Component({
  selector: 'kAddEntry',
  templateUrl: './playlist-add-entry.component.html',
  styleUrls: ['./playlist-add-entry.component.scss'],
    providers: [
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'manual-playlist-add-entries-table' }
    ]
})
export class PlaylistAddEntryComponent {
  @Output() onClosePopupWidget = new EventEmitter<void>();
  @Output() onAddEntries = new EventEmitter<KalturaMediaEntry[]>();

  public _selectedEntries: KalturaMediaEntry[] = [];
  public _addButtonLabel = '';
  public _addButtonLabelTranslation = '';
  public _enforcedFilters: Partial<EntriesFilters> = {
    'ingestionStatuses': [
      KalturaEntryStatus.preconvert.toString(),
      KalturaEntryStatus.ready.toString(),
      KalturaEntryStatus.noContent.toString(),
      KalturaEntryStatus.moderate.toString(),
      KalturaEntryStatus.blocked.toString()
    ]
  };

  constructor(private _appLocalization: AppLocalization) {
    this._addButtonLabelTranslation = this._addButtonLabel = this._appLocalization.get('applications.content.playlists.addToPlaylist');
  }

  public _selectionChanged(entries: KalturaMediaEntry[]): void {
    this._addButtonLabel = entries.length > 0
      ? `${this._addButtonLabelTranslation} ${entries.length}`
      : this._addButtonLabelTranslation;
  }

  public _addEntries(): void {
    this.onAddEntries.emit(this._selectedEntries);
    this.onClosePopupWidget.emit();
  }
}

