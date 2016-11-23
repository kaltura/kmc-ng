import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kEntriesTable',
  templateUrl: './entries-table.component.html',
  styleUrls: ['./entries-table.component.scss']
})
export class kEntriesTable {

  @Input() entries: any[] = [];
  @Input() filter: any = {};
  @Input() selectedEntries: any[] = [];
  @Input() loading: boolean =false;

  @Output()
  sortChanged = new EventEmitter<any>();
  @Output()
  actionSelected = new EventEmitter<any>();

  constructor() {
  }

  onSortChanged(event){
    this.sortChanged.emit(event);
  }

  onActionSelected(action, entryID){
    this.actionSelected.emit({"action": action, "entryID": entryID});
  }

}

