import { Component, ViewChild } from '@angular/core';
import { EntriesListComponent } from 'app-shared/content-shared/entries-list/entries-list.component';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';

@Component({
  selector: 'kPopupTest',
  templateUrl: './popup-test.component.html',
  providers: [EntriesStore]
})
export class PopupTestComponent {
  @ViewChild(EntriesListComponent) private _entriesList: EntriesListComponent;
  @ViewChild('testPopup') _testPopup;

  public _columns = {
    name: { sortable: true },
    plays: { sortable: true, width: '76px' },
    duration: { sortable: true, width: '104px' },
  };
  public _paginator = {
    rowsPerPageOptions: [25, 50, 100, 250, 500]
  };

  constructor(private _entriesStore: EntriesStore) {
    this._entriesStore.paginationCacheToken = 'test-popup';
  }

  open() {
    this._testPopup.open();
  }
}
