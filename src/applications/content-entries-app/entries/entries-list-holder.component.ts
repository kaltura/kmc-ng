import { Component, ViewChild } from '@angular/core';
import { EntriesListComponent } from 'app-shared/content-shared/entries-list/entries-list.component';

@Component({
  selector: 'kEntriesListHolder',
  templateUrl: './entries-list-holder.component.html'
})
export class EntriesListHolderComponent {
  @ViewChild(EntriesListComponent) private _entriesList: EntriesListComponent;
}

