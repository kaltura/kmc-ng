import { Component, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { NewUploadFile } from '../../kmc-upload-app/kmc-upload-app.service';

@Component({
  selector: 'kUploadListTable',
  templateUrl: './upload-list-table.component.html',
  styleUrls: ['./upload-list-table.component.scss']
})
export class UploadListTableComponent implements AfterViewInit {
  @Input()
  set uploads(data: Array<NewUploadFile>) {
    if (!this._deferredLoading) {
      // the table uses 'rowTrackBy' to track changes by id. To be able to reflect changes of entries
      // (ie when returning from entry page) - we should force detect changes on an empty list
      this._uploads = [];
      this._cdRef.detectChanges();
      this._uploads = data;
      this._cdRef.detectChanges();
      this._setEmptyMessage();
    } else {
      this._deferredUploads = data
    }
  }

  @Input() selectedUploads: Array<NewUploadFile> = [];

  @Output()
  sortChanged = new EventEmitter<any>();

  @Output()
  onSelectedEntriesChange = new EventEmitter<any>();

  @Output()
  onCancelUpload = new EventEmitter<NewUploadFile>();

  private _deferredUploads: any[];
  public _uploads: Array<NewUploadFile> = [];
  public _deferredLoading = true;
  public _emptyMessage = '';

  constructor(private _cdRef: ChangeDetectorRef, private _appTranslation: AppLocalization) {
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._uploads = this._deferredUploads;
        this._deferredUploads = null;
        this._setEmptyMessage();
      }, 0);
    }
  }

  private _setEmptyMessage() {
    if (!this._uploads.length) {
      this._emptyMessage = this._appTranslation.get('applications.content.table.noResults');
    }
  }

  public _relatedTableRowStyle(rowData): string {
    if (rowData.uploadFailure) {
      return 'has-error';
    }

    if (rowData.removing) {
      return 'removing';
    }

    return '';
  }
}

