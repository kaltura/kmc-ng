import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Menu, MenuItem } from 'primeng/primeng';
import { AppLocalization } from '../../../../../kaltura-ng/kaltura-common/dist/index';
import { DropFoldersStoreService } from 'applications/content-drop-folders-app/drop-folders-store/drop-folders-store.service';
import * as moment from 'moment';
import { KalturaDropFolderFile } from 'kaltura-ngx-client/api/types/KalturaDropFolderFile';

@Component({
  selector: 'kDropFoldersListTable',
  templateUrl: './drop-folders-table.component.html',
  styleUrls: ['./drop-folders-table.component.scss']
})

export class DropFoldersTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() selectedDropFolders: KalturaDropFolderFile[] = [];

  @Input() set dropFolders(data: KalturaDropFolderFile[]) {
    if (!this._deferredLoading) {
      this._dropFolders = [];
      this.cdRef.detectChanges();
      this._dropFolders = data || [];
      this.cdRef.detectChanges();
    } else {
      this._deferredDropFolders = data
    }
  }

  @Output() onSelectedDropFoldersChange = new EventEmitter<any>();
  @Output() navigateToEntry = new EventEmitter<string>();
  @Output() deleteDropFolderFiles = new EventEmitter<any>();

  @ViewChild('actionsmenu') private actionsMenu: Menu;

  private _deferredDropFolders: KalturaDropFolderFile[];

  public _deferredLoading = true;
  public _dropFolders: KalturaDropFolderFile[] = [];
  public _items: MenuItem[];
  public _emptyMessage = '';

  constructor(private _appLocalization: AppLocalization,
              private cdRef: ChangeDetectorRef,
              public _dropFoldersService: DropFoldersStoreService) {
  }

  ngOnInit() {
    this._emptyMessage = '';
    let loadedOnce = false; // used to set the empty message to 'no results' only after search
    this._dropFoldersService.dropFolders.data$
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
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._dropFolders = this._deferredDropFolders;
        this._deferredDropFolders = null;
      }, 0);
    }
  }

  ngOnDestroy() {
    this.actionsMenu.hide();
  }

  private _buildMenu(rowIndex: number, folder: KalturaDropFolderFile): void {
    this._items = [
      {
        label: this._appLocalization.get('applications.content.dropFolders.table.delete'),
        styleClass: 'kDeleteAction',
        command: () => this._onActionSelected('remove', rowIndex, folder)
      }
    ];
  }

  private _onActionSelected(action: string, rowIndex: number, folder: KalturaDropFolderFile) {
    switch (action) {
      case 'remove':
        this.deleteDropFolderFiles.emit(folder);
        break;
      default:
        break;
    }
  }

  public _openActionsMenu(event: any, rowIndex: number, folder: KalturaDropFolderFile) {
    if (this.actionsMenu) {
      this.actionsMenu.toggle(event);
      this._buildMenu(rowIndex, folder);
      this.actionsMenu.show(event);
    }
  }

  public _dateTooltip(dropFolder: KalturaDropFolderFile) {
    return this._appLocalization.get('applications.content.dropFolders.table.datesTooltip',
      {
        0: dropFolder.uploadStartDetectedAt ? moment(dropFolder.uploadStartDetectedAt.getTime()).format('DD/MM/YYYY HH:mm') : this._appLocalization.get('applications.content.dropFolders.table.notAvailable'),
        1: dropFolder.uploadEndDetectedAt ? moment(dropFolder.uploadEndDetectedAt.getTime()).format('DD/MM/YYYY HH:mm') : this._appLocalization.get('applications.content.dropFolders.table.notAvailable'),
        2: dropFolder.importStartedAt ? moment(dropFolder.importStartedAt.getTime()).format('DD/MM/YYYY HH:mm') : this._appLocalization.get('applications.content.dropFolders.table.notAvailable'),
        3: dropFolder.importEndedAt ? moment(dropFolder.importEndedAt.getTime()).format('DD/MM/YYYY HH:mm') : this._appLocalization.get('applications.content.dropFolders.table.notAvailable')
      }
    );
  }
}

