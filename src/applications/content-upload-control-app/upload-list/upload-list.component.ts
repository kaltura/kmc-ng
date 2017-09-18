import { Component, OnDestroy, OnInit } from '@angular/core';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { BrowserService, UploadFileData, KmcUploadManagementService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kUploadControlList',
  templateUrl: './upload-list.component.html',
  styleUrls: ['./upload-list.component.scss'],
})
export class UploadListComponent implements OnInit, OnDestroy {
  public _selectedUploads: Array<UploadFileData> = [];
  public _uploads: Array<UploadFileData> = [];
  public _isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;

  constructor(
      private _uploadService : KmcUploadManagementService,
      private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._uploadService.newUploadFiles$
      .cancelOnDestroy(this)
      .subscribe(files => {
        this._uploads = files;

        if (!this._uploads.length) {
          this._clearSelection();
        }
      });
  }

  ngOnDestroy() {
  }

  _clearSelection(): void {
    this._selectedUploads = [];
  }

  _selectedEntriesChange(event): void {
    this._selectedUploads = event;
  }

  _cancelUpload(file: UploadFileData): void {
    this._uploadService.cancelUpload(file.tempId);
  }

  _bulkCancel(): void {
    if (this._selectedUploads.length) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.uploadControl.bulkCancel.header'),
          message: this._appLocalization.get('applications.content.uploadControl.bulkCancel.message'),
          accept: () => this._uploadService.bulkCancel(this._selectedUploads)
        }
      );
    }
  }
}

