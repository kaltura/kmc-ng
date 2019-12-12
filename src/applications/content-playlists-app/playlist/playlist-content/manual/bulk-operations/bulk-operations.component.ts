import { Component, EventEmitter, Input, Output } from '@angular/core';
import { KalturaMediaEntry } from 'kaltura-ngx-client';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';

@Component({
  selector: 'kPlaylistEntryListBulkOperationsContent',
  templateUrl: './bulk-operations.component.html',
  styleUrls: ['./bulk-operations.component.scss'],
})
export class BulkOperationsComponent {
  @Input() selectedEntries: KalturaMediaEntry[] = [];
  @Input() entriesTotalCount = 0;
  @Input() duration = 0;
  @Input() isNewPlaylist: boolean;
  @Input() isRapt: boolean;

  @Output() addEntry = new EventEmitter<void>();
  @Output() clearSelection = new EventEmitter<void>();
  @Output() deleteEntries = new EventEmitter<KalturaMediaEntry[]>();
  @Output() moveEntries = new EventEmitter<{ entries: KalturaMediaEntry[], direction: 'up' | 'down' }>();

  public _kmcPermissions = KMCPermissions;

  constructor() {
  }

  public _moveEntries(direction: 'up' | 'down'): void {
    this.moveEntries.emit({ entries: this.selectedEntries, direction });
  }

}

