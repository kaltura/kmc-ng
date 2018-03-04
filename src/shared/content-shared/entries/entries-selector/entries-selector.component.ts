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
  @Input() selectedEntries: KalturaMediaEntry[] = [];
    @Input() enforcedFilters: Partial<EntriesFilters>;
    @Input() defaultFilters: Partial<EntriesFilters>;

  @Output() selectedEntriesChange = new EventEmitter<KalturaMediaEntry[]>();
  @ViewChild(EntriesListComponent) public _entriesList: EntriesListComponent;

  public _columns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    name: { sortable: true },
    mediaType: { sortable: true, width: '80px', align: 'center' },
    createdAt: { sortable: true, width: '140px' },
    plays: { sortable: true, width: '76px' },
    addToBucket: { sortable: false, width: '80px' }
  };

  constructor(public _entriesStore: EntriesStore) {
  }

  public _onActionSelected({ action, entry }: { action: string, entry: KalturaMediaEntry }): void {
    switch (action) {
      case 'addToBucket':
          const clonedEntry = <KalturaMediaEntry>Object.assign(KalturaTypesFactory.createObject(entry), entry);
        this.selectedEntries.push(clonedEntry);
        this.selectedEntriesChange.emit(this.selectedEntries);
        break;
      default:
        break;
    }
  }

  public _removeSelected(entry: KalturaMediaEntry): void {
    this.selectedEntries.splice(this.selectedEntries.indexOf(entry), 1);
    this.selectedEntriesChange.emit(this.selectedEntries);
  }
}
