import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { MenuItem, DataTable, Menu } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { KalturaMediaType, KalturaEntryStatus } from '@kaltura-ng2/kaltura-api';
import { Entry } from './entries.component';
import { EntriesStore } from "kmc-content-ui/entries-store/entries-store.service";

@Component({
  selector: 'kEntriesTable',
  templateUrl: './entries-table.component.html',
  styleUrls: ['./entries-table.component.scss']
})
export class kEntriesTableComponent implements AfterViewInit{

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
    if (status && status != KalturaEntryStatus.Ready.toString()){
        this.items.shift();
        if (mediaType && mediaType == KalturaMediaType.LiveStreamFlash.toString()){
            this.items.pop();
        }
    }
  }

  ngAfterViewInit(){
    if (this.dataTable.scrollBody) {
      this.dataTable.scrollBody.onscroll = () => {
        if (this.actionsMenu){
          this.actionsMenu.hide();
        }
      }
    }
  }

  openActionsMenu(event: any, entry: Entry){
    if (this.actionsMenu){
      this.actionsMenu.toggle(event);
      if (this.actionsMenuEntryId !== entry.id){
        this.buildMenu(entry.mediaType, entry.status);
        this.actionsMenuEntryId = entry.id;
        this.actionsMenu.show(event);
      }
    }
  }

  allowDrilldown(mediaType: string, status: string){
      let allowed = true;
      if ( mediaType && mediaType == KalturaMediaType.LiveStreamFlash.toString() && status && status != KalturaEntryStatus.Ready.toString()){
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

