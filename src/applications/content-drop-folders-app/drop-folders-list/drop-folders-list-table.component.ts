import { Component, Input, Output, EventEmitter, ViewChild, OnInit, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { DataTable, Menu, MenuItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaDropFolderFile } from 'kaltura-typescript-client/types/KalturaDropFolderFile';
import { DropFoldersService } from 'applications/content-drop-folders-app/drop-folders-list/drop-folders.service';
import * as moment from 'moment';

@Component({
  selector: 'kDropFoldersListTable',
  templateUrl: './drop-folders-list-table.component.html',
  styleUrls: ['./drop-folders-list-table.component.scss']
})

export class DropFoldersListTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('actionsmenu') private actionsMenu: Menu;
  @ViewChild('dataTable') private dataTable: DataTable;

  _deferredLoading = true;
  _dropFolders: any[] = [];
  _items: MenuItem[];
  _emptyMessage: string = '';
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
  @Output() navigateToEntry = new EventEmitter<string>();
  @Output() deleteDropFolderFiles = new EventEmitter<any>();

  constructor(
    private _appLocalization: AppLocalization,
    private cdRef: ChangeDetectorRef,
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
        0: dropFolder.uploadStartDetectedAt ? moment(dropFolder.uploadStartDetectedAt.getTime()).format('DD/MM/YYYY HH:mm') : this._appLocalization.get("applications.content.dropFolders.table.notAvailable"),
        1: dropFolder.uploadEndDetectedAt ? moment(dropFolder.uploadEndDetectedAt.getTime()).format('DD/MM/YYYY HH:mm') : this._appLocalization.get("applications.content.dropFolders.table.notAvailable"),
        2: dropFolder.importStartedAt ? moment(dropFolder.importStartedAt.getTime()).format('DD/MM/YYYY HH:mm') : this._appLocalization.get("applications.content.dropFolders.table.notAvailable"),
        3: dropFolder.importEndedAt ? moment(dropFolder.importEndedAt.getTime()).format('DD/MM/YYYY HH:mm') : this._appLocalization.get("applications.content.dropFolders.table.notAvailable")
      }
    )
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

  ngOnInit() {
    this._emptyMessage = '';
    let loadedOnce = false; // used to set the empty message to 'no results' only after search
    this._dropFoldersService.dropFolders$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          if (response.items.length === 0 && loadedOnce === false) {
            this._emptyMessage = '';
            loadedOnce = true;
          } else {
            if (loadedOnce) {
              this._emptyMessage = this._appLocalization.get('applications.content.table.noResults');
            }
          }
        },
        error => {
          console.warn('[kmcng] -> could not load entries'); // navigate to error page
          throw error;
        });
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid. This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(()=> {
        this._deferredLoading = false;
        this._dropFolders = this._deferredDropFolders;
        this._deferredDropFolders = null;
      }, 0);
    }
  }

  ngOnDestroy() {
    this.actionsMenu.hide();
  }
}

