import { Component, ViewChild } from '@angular/core';
import { EntriesListComponent } from 'app-shared/content-shared/entries-list/entries-list.component';
import { EntriesTableConfig } from 'app-shared/content-shared/entries-table/entries-table.component';

@Component({
  selector: 'kPopupTest',
  templateUrl: './popup-test.component.html'
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

  constructor() {
  }

  open() {
    this._testPopup.open();
  }
}
