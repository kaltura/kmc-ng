import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { EntriesListComponent } from 'app-shared/content-shared/entries-list/entries-list.component';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';
import { EntriesTableColumns } from 'app-shared/content-shared/entries-table/entries-table.component';

@Component({
  selector: 'kPlaylistRule',
  templateUrl: './playlist-rule.component.html',
  styleUrls: ['./playlist-rule.component.scss']
})
export class PlaylistRuleComponent {
  @ViewChild(EntriesListComponent) public _entriesList: EntriesListComponent;

  @Output() onClosePopupWidget = new EventEmitter<void>();

  public _columns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    name: {},
    id: { width: '100px' },
    mediaType: { width: '80px', align: 'center' },
    createdAt: { width: '140px' },
    duration: { width: '104px' },
    plays: { width: '100px' }
  };

  constructor(public _entriesStore: EntriesStore) {
    this._entriesStore.paginationCacheToken = 'entries-list';
  }
}
