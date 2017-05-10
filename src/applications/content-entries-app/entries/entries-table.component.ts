import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { MenuItem, DataTable, Menu } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { KalturaMediaType, KalturaEntryStatus, KalturaMediaEntry } from 'kaltura-typescript-client/types/all';
import { EntriesStore } from "../entries-store/entries-store.service";

@Component({
  selector: 'kEntriesTable',
  templateUrl: './entries-table.component.html',
  styleUrls: ['./entries-table.component.scss']
})
export class EntriesTableComponent implements AfterViewInit, OnInit, OnDestroy{

  public _loadingError = null;
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
  private entriesStoreStatusSubscription : ISubscription;

  public _items: MenuItem[];
  tableSelectedEntries: KalturaMediaEntry[] = [];



  constructor(private appLocalization: AppLocalization, public entriesStore : EntriesStore) {
  }


  ngOnInit() {

      this.entriesStoreStatusSubscription = this.entriesStore.status$.subscribe(
          result => {
                if (result.errorMessage)
                {
                    this._loadingError = { message : result.errorMessage, buttons : { retry : 'Retry'}};
                }else
                {
                    this._loadingError = null;
                }
          },
          error =>
          {
              console.warn("[kmcng] -> could not load entries"); //navigate to error page
              throw error;
          });

  }

  ngOnDestroy()
  {
      this.entriesStoreStatusSubscription.unsubscribe();
      this.entriesStoreStatusSubscription = null;
  }

    buildMenu(mediaType: KalturaMediaType = null, status: any = null) : void
  {
    this._items = [
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
    if (status instanceof KalturaEntryStatus && status.toString() != KalturaEntryStatus.ready.toString()){
        this._items.shift();
        if (mediaType && mediaType.toString() == KalturaMediaType.liveStreamFlash.toString()){
            this._items.pop();
        }
    }
  }

    ngAfterViewInit() {
        const scrollBody = this.dataTable.el.nativeElement.getElementsByClassName("ui-datatable-scrollable-body");
        if (scrollBody && scrollBody.length > 0) {
            scrollBody[0].onscroll = () => {
                if (this.actionsMenu) {
                    this.actionsMenu.hide();
                }
            }
        }
    }

    onLoadingAction(actionKey : string)
    {
        if (actionKey === 'retry')
        {
            this.entriesStore.reload();
        }
    }

  openActionsMenu(event: any, entry: KalturaMediaEntry){
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
      if ( mediaType && mediaType == KalturaMediaType.liveStreamFlash.toString() && status && status != KalturaEntryStatus.ready.toString()){
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
    event.forEach((entry: KalturaMediaEntry) => {
      this.selectedEntries.push(entry.id)
    });
    this.selectedEntriesChange.emit(this.selectedEntries);
  }

  scrollToTop() {
      const scrollBodyArr = this.dataTable.el.nativeElement.getElementsByClassName("ui-datatable-scrollable-body");
      if (scrollBodyArr && scrollBodyArr.length > 0) {
          const scrollBody: HTMLDivElement = scrollBodyArr[0];
          scrollBody.scrollTop = 0;
      }
  }
}

