import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { EntriesListComponent } from 'app-shared/content-shared/entries/entries-list/entries-list.component';
import { EntriesStore } from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { EntriesTableColumns } from 'app-shared/content-shared/entries/entries-table/entries-table.component';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';


@Component({
  selector: 'kEntriesSelector',
  templateUrl: './entries-selector.component.html',
  styleUrls: ['./entries-selector.component.scss'],
  providers: [EntriesStore]
})
export class EntriesSelectorComponent {
  @Input() selectedEntries: KalturaMediaEntry[] = [];
  @Input() set filterByStatus(statuses: number[]) {
    // this._entriesStore.filter({
    //     ingestionStatuses: statuses
    // })
  }
  @Output() selectedEntriesChange = new EventEmitter<KalturaMediaEntry[]>();
  @ViewChild(EntriesListComponent) public _entriesList: EntriesListComponent;

  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;

  public _columns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    name: { sortable: true },
    mediaType: { sortable: true, width: '80px', align: 'center' },
    createdAt: { sortable: true, width: '140px' },
    plays: { sortable: true, width: '76px' },
    addToBucket: { sortable: false, width: '80px' }
  };

  constructor(public _entriesStore: EntriesStore) {
    this._entriesStore.paginationCacheToken = 'entries-selector';
  }

  public _onActionSelected({ action, entryId }: { action: string, entryId: KalturaMediaEntry }): void {
    switch (action) {
      case 'addToBucket':
        this.selectedEntries.push(entryId);
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
