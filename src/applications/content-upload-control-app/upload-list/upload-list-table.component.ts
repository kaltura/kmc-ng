import { Component, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { MenuItem, DataTable, Menu } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { INewUploadFile } from '../../kmc-upload-app/kmc-upload-app.service';

@Component({
  selector: 'kUploadListTable',
  templateUrl: './upload-list-table.component.html',
  styleUrls: ['./upload-list-table.component.scss']
})
export class UploadListTableComponent implements AfterViewInit {
  @Input()
  set uploads(data: Array<INewUploadFile>) {
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

  @Input() selectedUploads: Array<INewUploadFile> = [];

  @Output()
  sortChanged = new EventEmitter<any>();

  @Output()
  onSelectedEntriesChange = new EventEmitter<any>();

  @ViewChild('dataTable') private dataTable: DataTable;

  private _deferredUploads: any[];
  public _uploads: Array<INewUploadFile> = [];
  public _deferredLoading = true;
  public _emptyMessage = '';

  constructor(private _appLocalization: AppLocalization,
              private _cdRef: ChangeDetectorRef) {
  }

  _onSortChanged(event) {
    this.sortChanged.emit(event);
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._uploads = this._deferredUploads;
        this._deferredUploads = null;
      }, 0);
    }
  }
}

