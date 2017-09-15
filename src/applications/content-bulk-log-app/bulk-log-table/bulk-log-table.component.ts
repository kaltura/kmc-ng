import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { DataTable, Menu, MenuItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { KalturaBulkUpload } from 'kaltura-typescript-client/types/KalturaBulkUpload';
import { BulkLogStoreService } from '../bulk-log-store/bulk-log-store.service';

@Component({
  selector: 'kBulkLogTable',
  templateUrl: './bulk-log-table.component.html',
  styleUrls: ['./bulk-log-table.component.scss']
})
export class BulkLogTableComponent implements AfterViewInit, OnInit, OnDestroy {

  public _blockerMessage: AreaBlockerMessage = null;

  public _bulkLog: any[] = [];
  private _deferredEntries: any[];

  @Input()
  set list(data: any[]) {
    if (!this._deferredLoading) {
      // the table uses 'rowTrackBy' to track changes by id. To be able to reflect changes of entries
      // (ie when returning from bulk log page) - we should force detect changes on an empty list
      this._bulkLog = [];
      this._cdRef.detectChanges();
      this._bulkLog = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredEntries = data
    }
  }

  @Input() filter: any = {};
  @Input() selectedBulkLogItems: any[] = [];

  @Output()
  sortChanged = new EventEmitter<any>();
  @Output()
  actionSelected = new EventEmitter<{ action: string, bulkLogItem: KalturaBulkUpload }>();
  @Output()
  selectedBulkLogChange = new EventEmitter<any>();

  @ViewChild('dataTable') private dataTable: DataTable;
  @ViewChild('actionsmenu') private actionsMenu: Menu;
  private bulkLogItem: KalturaBulkUpload;

  public _deferredLoading = true;
  public _emptyMessage = '';

  public _items: MenuItem[];

  public rowTrackBy: Function = (index: number, item: any) => {
    return item.id
  };

  constructor(private _appLocalization: AppLocalization,
              private _cdRef: ChangeDetectorRef,
              public _store: BulkLogStoreService) {
  }

  _convertSortValue(value: boolean): number {
    return value ? 1 : -1;
  }

  ngOnInit() {
    this._blockerMessage = null;
    this._emptyMessage = '';
  }

  ngOnDestroy() {
    this.actionsMenu.hide();
  }

  buildMenu(): void {
    this._items = [
      {
        label: this._appLocalization.get('applications.content.bulkUpload.table.actions.delete'),
        command: (event) => this.onActionSelected('delete', this.bulkLogItem)
      },
      {
        label: this._appLocalization.get('applications.content.bulkUpload.table.actions.downloadLog'),
        command: (event) => this.onActionSelected('downloadLog', this.bulkLogItem)
      },
      {
        label: this._appLocalization.get('applications.content.bulkUpload.table.actions.downloadFile'),
        command: (event) => this.onActionSelected('downloadFile', this.bulkLogItem)
      }
    ];
  }

  ngAfterViewInit() {
    const scrollBody = this.dataTable.el.nativeElement.getElementsByClassName('ui-datatable-scrollable-body');
    if (scrollBody && scrollBody.length > 0) {
      scrollBody[0].onscroll = () => {
        if (this.actionsMenu) {
          this.actionsMenu.hide();
        }
      }
    }
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._bulkLog = this._deferredEntries;
        this._deferredEntries = null;
      }, 0);
    }
  }

  openActionsMenu(event: any, bulkLogItem: KalturaBulkUpload) {
    if (this.actionsMenu) {
      this.actionsMenu.toggle(event);
      if (!this.bulkLogItem || this.bulkLogItem.id !== bulkLogItem.id) {
        this.bulkLogItem = bulkLogItem;
        this.buildMenu();
        this.actionsMenu.show(event);
      }
    }
  }

  onActionSelected(action: string, bulkLogItem: KalturaBulkUpload): void {
    this.actionSelected.emit({ action, bulkLogItem });
  }

  onSelectionChange(event) {
    this.selectedBulkLogChange.emit(event);
  }

  scrollToTop() {
    const scrollBodyArr = this.dataTable.el.nativeElement.getElementsByClassName('ui-datatable-scrollable-body');
    if (scrollBodyArr && scrollBodyArr.length > 0) {
      const scrollBody: HTMLDivElement = scrollBodyArr[0];
      scrollBody.scrollTop = 0;
    }
  }
}

