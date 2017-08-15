import { Component, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { MenuItem, DataTable, Menu } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';

@Component({
  selector: 'kUploadListTable',
  templateUrl: './upload-list-table.component.html',
  styleUrls: ['./upload-list-table.component.scss']
})
export class UploadListTableComponent {
  @Input()
  set uploads(data: any[]) {
    if (!this._deferredLoading) {
      // the table uses 'rowTrackBy' to track changes by id. To be able to reflect changes of entries
      // (ie when returning from entry page) - we should force detect changes on an empty list
      this._uploads = [];
      this._cdRef.detectChanges();
      this._uploads = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredUploads = data
    }
  }

  @Input() filter: any = {};

  @Input() selectedUploads: any[] = [];

  @Output()
  sortChanged = new EventEmitter<any>();

  @Output()
  actionSelected = new EventEmitter<any>();

  @Output()
  selectedEntriesChange = new EventEmitter<any>();

  @ViewChild('dataTable') private dataTable: DataTable;

  private _deferredUploads: any[];
  private _actionsMenuEntryId = '';
  private _entriesStoreStatusSubscription: ISubscription;

  public _blockerMessage: AreaBlockerMessage = null;
  public _uploads: any[] = [];
  public _deferredLoading = true;
  public _emptyMessage = '';
  public _items: MenuItem[];

  public _rowTrackBy: Function = (index: number, item: any) => item.id;

  constructor(private _appLocalization: AppLocalization,
              private _cdRef: ChangeDetectorRef) {
  }

  _onSortChanged(event) {
    this.sortChanged.emit(event);
  }

  _onSelectionChange(event) {
    this.selectedEntriesChange.emit(event);
  }

  public scrollToTop() {
    const scrollBodyArr = this.dataTable.el.nativeElement.getElementsByClassName('ui-datatable-scrollable-body');
    if (scrollBodyArr && scrollBodyArr.length > 0) {
      const scrollBody: HTMLDivElement = scrollBodyArr[0];
      scrollBody.scrollTop = 0;
    }
  }
}

