import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { DataTable, Menu, MenuItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaDropFolderFile } from 'kaltura-typescript-client/types/KalturaDropFolderFile';
import { DatePipe } from '@angular/common';
import { DropFoldersService } from 'applications/content-drop-folders-app/drop-folders-list/drop-folders.service';


@Component({
  selector: 'kDropFoldersListTable',
  templateUrl: './drop-folders-list-table.component.html',
  styleUrls: ['./drop-folders-list-table.component.scss'],
  providers: [DatePipe]
})
export class DropFoldersListTableComponent implements AfterViewInit {
  @ViewChild('actionsmenu') private actionsMenu: Menu;
  @ViewChild('dataTable') private dataTable: DataTable;

  _deferredLoading = true;
  _dropFolders: any[] = [];
  _items: MenuItem[];
  private _deferredDropFolders : any[];

  @Input() selectedDropFolders: any[] = [];
  @Input() set dropFolders(data: any[]) {
    if (!this._deferredLoading) {
      this._dropFolders = [];
      this.cdRef.detectChanges();
      this._dropFolders = data;
      this.cdRef.detectChanges();
    } else {
      this._deferredDropFolders = data
    }
  }

  @Output() onSelectedDropFoldersChange = new EventEmitter<any>();
  @Output() isEntryExist = new EventEmitter<any>();
  @Output() deleteDropFolderFiles = new EventEmitter<any>();

  constructor(
    private _appLocalization: AppLocalization,
    private cdRef: ChangeDetectorRef,
    private _datePipe: DatePipe,
    public _dropFoldersService: DropFoldersService
  ) {}

  openActionsMenu(event: any, rowIndex: number, folder: KalturaDropFolderFile) {
    if (this.actionsMenu) {
      this.actionsMenu.toggle(event);
      this.buildMenu(rowIndex, folder);
      this.actionsMenu.show(event);
    }
  }

  buildMenu(rowIndex: number, folder: KalturaDropFolderFile): void {
    this._items = [
      {
        label: this._appLocalization.get("applications.content.dropFolders.table.delete"),
        styleClass: "kDeleteAction",
        command: (event) => {
          this.onActionSelected("remove", rowIndex, folder);
        }
      }
    ];
  }

  dateTooltip(dropFolder: KalturaDropFolderFile) {
    return this._appLocalization.get("applications.content.dropFolders.table.datesTooltip",
      {
        0: dropFolder.uploadStartDetectedAt ? this._datePipe.transform(dropFolder.uploadStartDetectedAt.getTime(), 'dd/MM/yy HH:mm') : this._appLocalization.get("applications.content.dropFolders.table.notAvailable"),
        1: dropFolder.uploadEndDetectedAt ? this._datePipe.transform(dropFolder.uploadEndDetectedAt.getTime(), 'dd/MM/yy HH:mm') : this._appLocalization.get("applications.content.dropFolders.table.notAvailable"),
        2: dropFolder.uploadEndDetectedAt ? this._datePipe.transform(dropFolder.uploadEndDetectedAt.getTime(), 'dd/MM/yy HH:mm') : this._appLocalization.get("applications.content.dropFolders.table.notAvailable"),
        3: dropFolder.importEndedAt ? this._datePipe.transform(dropFolder.importEndedAt.getTime(), 'dd/MM/yy HH:mm') : this._appLocalization.get("applications.content.dropFolders.table.notAvailable")
      }
    )
  }

  isExistEntry(event): void {
    this.isEntryExist.emit(event);
  }

  onActionSelected(action: string, rowIndex: number, folder: KalturaDropFolderFile) {
    switch (action){
      case "remove":
        this.deleteDropFolderFiles.emit(folder);
        break;
      default:
        break;
    }
  }

  scrollToTop() {
    const scrollBodyArr = this.dataTable.el.nativeElement.getElementsByClassName("ui-datatable-scrollable-body");
    if (scrollBodyArr && scrollBodyArr.length > 0) {
      const scrollBody: HTMLDivElement = scrollBodyArr[0];
      scrollBody.scrollTop = 0;
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
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid. This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(()=> {
        this._deferredLoading = false;
        this._dropFolders = this._deferredDropFolders;
        this._deferredDropFolders = null;
      }, 0);
    }
  }
}

