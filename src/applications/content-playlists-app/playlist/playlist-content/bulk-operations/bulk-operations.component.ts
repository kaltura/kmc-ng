import { Component, EventEmitter, Input, Output } from '@angular/core';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';

@Component({
  selector: 'kPlaylistEntryListBulkOperationsContent',
  templateUrl: './bulk-operations.component.html',
  styleUrls: ['./bulk-operations.component.scss'],
})
export class BulkOperationsComponent {
  @Input() selectedEntries: KalturaMediaEntry[] = [];
  @Input() entriesTotalCount = 0;
  @Input() duration = 0;

  @Output() addEntry = new EventEmitter<void>();
  @Output() clearSelection = new EventEmitter<void>();
  @Output() deleteEntries = new EventEmitter<KalturaMediaEntry[]>();
  @Output() moveEntries = new EventEmitter<{ entries: KalturaMediaEntry[], direction: 'up' | 'down' }>();

  public _moveEntries(direction: 'up' | 'down'): void {
    this.moveEntries.emit({ entries: this.selectedEntries, direction });
  }
}

