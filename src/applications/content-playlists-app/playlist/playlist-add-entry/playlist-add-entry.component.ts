import { Component, EventEmitter, Output } from '@angular/core';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { AppLocalization } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kAddEntry',
  templateUrl: './playlist-add-entry.component.html',
  styleUrls: ['./playlist-add-entry.component.scss']
})
export class PlaylistAddEntryComponent {
  @Output() onClosePopupWidget = new EventEmitter<void>();
  @Output() onAddEntries = new EventEmitter<KalturaMediaEntry[]>();

  public _selectedEntries: KalturaMediaEntry[] = [];
  public _addButtonLabel = '';
  public _addButtonLabelTranslation = '';

  constructor(private _appLocalization: AppLocalization) {
    this._addButtonLabelTranslation = this._addButtonLabel = this._appLocalization.get('applications.content.playlists.addToPlaylist');
  }

  public _selectionChanged(entries: KalturaMediaEntry[]): void {
    this._selectedEntries = entries;
    this._addButtonLabel = this._selectedEntries.length > 0
      ? `${this._addButtonLabelTranslation} ${this._selectedEntries.length}`
      : this._addButtonLabelTranslation;
  }

  public _addEntries(): void {
    this.onAddEntries.emit(this._selectedEntries);
    this.onClosePopupWidget.emit();
  }
}

