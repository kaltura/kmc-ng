import { Component, OnDestroy, OnInit } from '@angular/core';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { BrowserService, NewEntryUploadFile } from 'app-shared/kmc-shell';
import { AppLocalization, TrackedFileStatuses, UploadManagement } from '@kaltura-ng/kaltura-common';

export interface UploadFileData {
  id: string;
  fileName: string;
}

@Component({
  selector: 'kUploadControlList',
  templateUrl: './upload-list.component.html',
  styleUrls: ['./upload-list.component.scss'],
})
export class UploadListComponent implements OnInit, OnDestroy {
  public _selectedUploads: UploadFileData[] = [];
  public _uploads: UploadFileData[] = [];
  public _isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;

  constructor(private _uploadManagement: UploadManagement,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._createInitialUploadsList();

    // TODO [kmcng] Remember to perform cancel/purge using the upload management service so the singleton service will also handle those scenarios
    this._uploadManagement.onFileStatusChanged$
      .cancelOnDestroy(this)
      .subscribe(
        trackedFile => {
          // TODO [kmcng] handle all relevant statues
          if (trackedFile.data instanceof NewEntryUploadFile) {

            switch (trackedFile.status) {
              case TrackedFileStatuses.purged:
                // remove from list
                break;
              case TrackedFileStatuses.waitingUpload:
                // do nothing
                break;
              case TrackedFileStatuses.added:
                // TODO [kmcng] remove duplicate with '_createInitialUploadsList'
                this._uploads.push({
                  id: trackedFile.id,
                  fileName: trackedFile.data.getFileName()
                });
                break;
              default:
                break;
            }

          }
        }
      )
  }

  private _createInitialUploadsList(): void {
    const items: UploadFileData[] = [];

    this._uploadManagement.getTrackedFiles()
      .forEach(trackedFile => {
        if (trackedFile.data instanceof NewEntryUploadFile) {

          // TODO [kmcng]complete logic if needed
          items.push({
            id: trackedFile.id,
            fileName: trackedFile.data.getFileName()
          })
        }

      });
    this._uploads = items;
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
    this._uploadManagement.cancelUpload(file.id, true);
  }

  _bulkCancel(): void {
    if (this._selectedUploads.length) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.uploadControl.bulkCancel.header'),
          message: this._appLocalization.get('applications.content.uploadControl.bulkCancel.message'),
          accept: () => {
            this._selectedUploads.forEach(file => {
              this._uploadManagement.cancelUpload(file.id, true);
            });

            this._clearSelection();
          }
        }
      );
    }
  }
}

