import { Component, OnDestroy, OnInit } from '@angular/core';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { BrowserService, NewEntryUploadFile } from 'app-shared/kmc-shell';
import { AppLocalization, TrackedFile, TrackedFileStatuses, UploadManagement } from '@kaltura-ng/kaltura-common';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';

export interface UploadFileData {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedOn: Date;
  status: TrackedFileStatuses;
  mediaType: KalturaMediaType;
  entryId?: string;
  progress?: number;
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
    this._uploadManagement.onFileStatusChanged$
      .cancelOnDestroy(this)
      .filter(trackedFile => trackedFile.data instanceof NewEntryUploadFile)
      .subscribe(
        (trackedFile: TrackedFile) => {
          // NOTE: this service does not handle 'purged' and 'waitingUpload' statuses by design.
          switch (trackedFile.status) {
            case TrackedFileStatuses.added:
              this._addFile(trackedFile);
              break;

            case TrackedFileStatuses.mediaCreated:
              this._updateFile(trackedFile.id, { entryId: trackedFile.entryId });
              break;

            case TrackedFileStatuses.uploading:
            case TrackedFileStatuses.uploadCompleted:
              this._updateFile(trackedFile.id, {
                progress: trackedFile.progress,
                status: trackedFile.status
              });

              setTimeout(() => {
                this._removeFile(trackedFile.id);
                this._uploadManagement.purgeUpload(trackedFile.id);
              }, 5000);
              break;

            case TrackedFileStatuses.uploadFailed:
              this._updateFile(trackedFile.id, { status: trackedFile.status });
              break;

            case TrackedFileStatuses.purged:
              this._removeFile(trackedFile.id);
              break;

            default:
              break;
          }
        }
      )
  }

  ngOnDestroy() {
  }

  private _addFile(trackedFile: TrackedFile): void {
    const fileData = <NewEntryUploadFile>trackedFile.data;

    this._uploads.push({
      id: trackedFile.id,
      fileName: fileData.getFileName(),
      fileSize: fileData.getFileSize(),
      mediaType: fileData.mediaType,
      status: trackedFile.status,
      uploadedOn: trackedFile.uploadStartAt,
      progress: trackedFile.progress
    });
  }

  private _removeFile(id: string): void {
    const relevantFileIndex = this._uploads.findIndex(file => file.id === id);
    this._uploads.splice(relevantFileIndex, 1);
  }

  private _updateFile(id, changes: Partial<UploadFileData>): void {
    const relevantFile = this._uploads.find(file => file.id === id);

    if (relevantFile) {
      Object.assign(relevantFile, changes);
    }
  }

  public _clearSelection(): void {
    this._selectedUploads = [];
  }

  public _selectedEntriesChange(event): void {
    this._selectedUploads = event;
  }

  public _cancelUpload(file: UploadFileData): void {
    this._uploadManagement.cancelUpload(file.id, true);
  }

  public _bulkCancel(): void {
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

