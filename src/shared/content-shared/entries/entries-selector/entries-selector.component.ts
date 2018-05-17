import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { EntriesListComponent } from 'app-shared/content-shared/entries/entries-list/entries-list.component';
import {
  EntriesFilters, EntriesStore,
  EntriesStorePaginationCacheToken
} from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { EntriesTableColumns } from 'app-shared/content-shared/entries/entries-table/entries-table.component';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaTypesFactory } from 'kaltura-ngx-client';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';

export enum EntriesSelectorSelectionMode {
  multiple = 'multiple',
  multipleUnique = 'multipleUnique',
  single = 'single'
}

@Component({
  selector: 'kEntriesSelector',
  templateUrl: './entries-selector.component.html',
  styleUrls: ['./entries-selector.component.scss'],
  providers: [
    EntriesStore,
    { provide: EntriesStorePaginationCacheToken, useValue: 'entries-selector' }
  ]
})
export class EntriesSelectorComponent {

  public _kmcPermissions = KMCPermissions;

  @Input() selectionMode: EntriesSelectorSelectionMode = EntriesSelectorSelectionMode.multiple;
  @Input() selectedEntries: KalturaMediaEntry[] = [];
  @Input() enforcedFilters: Partial<EntriesFilters>;
  @Input() defaultFilters: Partial<EntriesFilters>;
  @Input() columns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    name: { sortable: true },
    mediaType: { sortable: true, width: '80px', align: 'center' },
    createdAt: { sortable: true, width: '140px' },
    plays: { sortable: true, width: '76px' },
    addToBucket: { sortable: false, width: '80px' }
  };

  @Output() selectedEntriesChange = new EventEmitter<KalturaMediaEntry[]>();
  @ViewChild(EntriesListComponent) public _entriesList: EntriesListComponent;

  constructor(public _entriesStore: EntriesStore) {
  }

  public _onActionSelected({ action, entry }: { action: string, entry: KalturaMediaEntry }): void {
    switch (action) {
      case 'addToBucket':
        this._addToBucket(entry);
        break;
      default:
        break;
    }
  }

  public _removeSelected(entry: KalturaMediaEntry): void {
    this.selectedEntries.splice(this.selectedEntries.indexOf(entry), 1);
    this.selectedEntriesChange.emit(this.selectedEntries);
  }

  public _addToBucket(entry: KalturaMediaEntry): void {
    switch (this.selectionMode) {
      case EntriesSelectorSelectionMode.multiple:
        const clonedEntry = <KalturaMediaEntry>Object.assign(KalturaTypesFactory.createObject(entry), entry);
        this.selectedEntries.push(clonedEntry);
        break;

      case EntriesSelectorSelectionMode.multipleUnique:
        const newSelection = this.selectedEntries.indexOf(entry) === -1;
        if (newSelection) {
          this.selectedEntries.push(entry);
        }
        break;

      case EntriesSelectorSelectionMode.single:
        this.selectedEntries = [entry];
        break;
      default:
        break;
    }

    this.selectedEntriesChange.emit(this.selectedEntries);
  }
}
