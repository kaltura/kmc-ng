import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { UploadFileData } from './upload-list.component';


@Component({
  selector: 'kUploadListTable',
  templateUrl: './upload-list-table.component.html',
  styleUrls: ['./upload-list-table.component.scss']
})
export class UploadListTableComponent implements AfterViewInit {
  @Input()
  set uploads(data: Array<UploadFileData>) {
    if (!this._deferredLoading) {
      // Important: no need to use 'cdRef.detectChanges()' here since the table
      // doesn't use 'rowTrackBy' property
      this._uploads = data;
      this._setEmptyMessage();
    } else {
      this._deferredUploads = data
    }
  }

  @Input() selectedUploads: Array<UploadFileData> = [];

  @Output()
  sortChanged = new EventEmitter<any>();

  @Output()
  onSelectedEntriesChange = new EventEmitter<any>();

  @Output()
  onCancelUpload = new EventEmitter<UploadFileData>();

  private _deferredUploads: any[];
  public _uploads: Array<UploadFileData> = [];
  public _deferredLoading = true;
  public _emptyMessage = '';

  constructor( private _appTranslation: AppLocalization) {
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

    private _reorderFiles(): void {
    // TODO [kmcng]
        // this._updateFiles(R.sortBy(R.prop('statusWeight'))(this._getFiles()));
    }

    private _getStatusWeight(status: string): number {
    // TODO [kmcng]
    throw new Error('not implemented');
        // switch (status) {
        //     case 'uploadFailed':
        //     case 'uploadCompleted':
        //         return 0;
        //     case 'uploading':
        //         return 1;
        //     case 'pending':
        //         return 2;
        //     default:
        //         return 3;
        // }
    }


    public _relatedTableRowStyle(rowData: UploadFileData): string {
    // TODO [kmcng] original data provided from service doesn't have those properties
    // if (rowData.uploadFailure) {
    //   return 'has-error';
    // }
    //
    // if (rowData.removing) {
    //   return 'removing';
    // }

    return '';
  }
}

