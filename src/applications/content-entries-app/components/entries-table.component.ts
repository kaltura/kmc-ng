import { Component, Input, Output, EventEmitter } from '@angular/core';
import {MenuItem} from 'primeng/primeng';
import {Entry} from "./entries.component";

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
  @Output()
  selectedEntriesChange = new EventEmitter<any>();

  private items: MenuItem[];

  dp(items : any, menu : any)  : void
  {

    debugger;
  }
  constructor() {
    this.buildMenu();

  }

  buildMenu() : void
  {
    this.items = [
      {label: 'New', icon: 'fa-plus'},
      {label: 'Open', icon: 'fa-download'},
      {label: 'Undo', icon: 'fa-refresh'}
    ];
  }

  onSortChanged(event){
    this.sortChanged.emit(event);
  }

  onActionSelected(action, entryID){
    this.actionSelected.emit({"action": action, "entryID": entryID});
  }

  onSelectionChange(event){
    this.selectedEntries = [];
    event.forEach((entry: Entry) => {
      this.selectedEntries.push(entry.id)
    });
    this.selectedEntriesChange.emit(this.selectedEntries);
  }

}

