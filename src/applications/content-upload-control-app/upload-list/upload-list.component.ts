import { Component, OnDestroy, OnInit } from '@angular/core';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { NewUploadFile, KmcUploadAppService } from '../../kmc-upload-app/kmc-upload-app.service';

@Component({
  selector: 'kUploadControlList',
  templateUrl: './upload-list.component.html',
  styleUrls: ['./upload-list.component.scss'],
})
export class UploadListComponent implements OnInit, OnDestroy {
  public _selectedUploads: Array<NewUploadFile> = [];
  public _uploads: Array<NewUploadFile> = [];
  public _isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;

  constructor(private _uploadService: KmcUploadAppService) {
  }

  ngOnInit() {
    this._uploadService.newUploadFiles$
      .cancelOnDestroy(this)
      .subscribe(files => {
        this._uploads = files;
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

  _cancelUpload(file: NewUploadFile): void {
    this._uploadService.cancelUpload(file.tempId);
  }
}

