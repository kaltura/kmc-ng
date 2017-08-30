import { Component, ViewChild } from '@angular/core';
import { EntriesListComponent } from 'app-shared/content-shared/entries-list/entries-list.component';

@Component({
  selector: 'kEntriesListHolder',
  templateUrl: './entries-list-holder.component.html'
})
export class EntriesListHolderComponent {
  @ViewChild(EntriesListComponent) private _entriesList: EntriesListComponent;

  public _tableConfig = {
    dataKey: 'id',
    scrollHeight: '100%',
    columns: {
      thumbnailUrl: { width: '100px' },
      name: { sortable: 'custom' },
      id: { width: '100px' },
      mediaType: { sortable: 'custom', width: '80px', align: 'center' },
      plays: { sortable: 'custom', width: '76px' },
      createdAt: { sortable: true, width: '140px' },
      duration: { sortable: 'custom', width: '104px' },
      status: { width: '100px' }
    }
  };
}

