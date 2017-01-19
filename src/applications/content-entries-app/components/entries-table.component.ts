import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { MenuItem, DataTable, Menu } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { Entry } from './entries.component';
import {EntriesStore, EntryType, EntryStatus} from "kmc-content-ui/entries-store/entries-store.service";

@Component({
  selector: 'kEntriesTable',
  templateUrl: './entries-table.component.html',
  styleUrls: ['./entries-table.component.scss']
})
export class kEntriesTable implements AfterViewInit{

  @Input() entries: any[] = [];
  @Input() filter: any = {};
  @Input() selectedEntries: any[] = [];

  @Output()
  sortChanged = new EventEmitter<any>();
  @Output()
  actionSelected = new EventEmitter<any>();
  @Output()
  selectedEntriesChange = new EventEmitter<any>();

  @ViewChild('dataTable') private dataTable: DataTable;
  @ViewChild('actionsmenu') private actionsMenu: Menu;
  private actionsMenuEntryId: string = "";

  private items: MenuItem[];
  tableSelectedEntries: Entry[] = [];


  constructor(private appLocalization: AppLocalization, private entriesStore : EntriesStore) {
  }

  buildMenu(mediaType: string = null, status: string = null) : void
  {
    this.items = [
      {label: this.appLocalization.get("applications.content.table.previewAndEmbed"), command: (event) => {
        this.onActionSelected("preview", this.actionsMenuEntryId);
      }},
      {label: this.appLocalization.get("applications.content.table.delete"), command: (event) => {
        this.onActionSelected("delete", this.actionsMenuEntryId);
      }},
      {label: this.appLocalization.get("applications.content.table.view"), command: (event) => {
        this.onActionSelected("view", this.actionsMenuEntryId);
      }}
    ];
    if (status && status != EntryStatus.Ready){
        this.items.shift();
        if (mediaType && mediaType == EntryType.Live.toString()){
            this.items.pop();
        }
    }
  }

  ngAfterViewInit(){
    this.buildMenu();
    if (this.dataTable.scrollBody) {
      this.dataTable.scrollBody.onscroll = () => {
        if (this.actionsMenu){
          this.actionsMenu.hide();
        }
      }
    }
  }

  openActionsMenu(event: any, entryId: string, mediaType: string, status: string){
    if (this.actionsMenu){
      this.actionsMenu.toggle(event);
      if (this.actionsMenuEntryId !== entryId){
        this.buildMenu(mediaType, status);
        this.actionsMenuEntryId = entryId;
        this.actionsMenu.show(event);
      }
    }
  }

  allowDrilldown(mediaType: string, status: string){
      let allowed = true;
      if ( mediaType && mediaType == EntryType.Live.toString() && status && status != EntryStatus.Ready){
          allowed = false;
      }
      return allowed;
  }

  onActionSelected(action: string, entryID: string, mediaType: string = null, status: string = null){
    if (this.allowDrilldown(mediaType, status)) {
        this.actionSelected.emit({"action": action, "entryID": entryID});
    }
  }

  onSortChanged(event){
    this.sortChanged.emit(event);
  }

  onSelectionChange(event){
    this.selectedEntries = [];
    event.forEach((entry: Entry) => {
      this.selectedEntries.push(entry.id)
    });
    this.selectedEntriesChange.emit(this.selectedEntries);
  }

}

