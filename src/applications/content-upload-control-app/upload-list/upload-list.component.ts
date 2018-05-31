import { Component, OnDestroy, OnInit } from '@angular/core';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { BrowserService, NewEntryUploadFile, NewEntryUploadService } from 'app-shared/kmc-shell';
import { TrackedFileStatuses, UploadManagement } from '@kaltura-ng/kaltura-common';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import { KalturaMediaType } from 'kaltura-ngx-client/api/types/KalturaMediaType';
import { TrackedFileData } from '@kaltura-ng/kaltura-common/upload-management/tracked-file';
import { NewEntryFlavourFile } from 'app-shared/kmc-shell/new-entry-flavour-file';
import { KalturaUploadFile } from 'app-shared/kmc-shared';
import { ContentUploadsMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { NewReplaceVideoUploadFile } from 'app-shared/kmc-shell/new-replace-video-upload/new-replace-video-upload-file';

type MonitoredUploadFile = NewEntryUploadFile | NewEntryFlavourFile;

function isMonitoredUploadFile(object: any): object is MonitoredUploadFile {
    return object instanceof NewEntryUploadFile || object instanceof NewEntryFlavourFile || object instanceof NewReplaceVideoUploadFile;
}

export interface UploadFileData {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedOn: Date;
  status: string;
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
              private _newEntryUploadService: NewEntryUploadService,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _contentUploadsMainView: ContentUploadsMainViewService) {
  }

  ngOnInit() {
      if (this._contentUploadsMainView.isAvailable()) {
          this._uploadManagement.getTrackedFiles().forEach(file => this._addFile(file));

          // listen for mediaCreated to show entryId in the upload list once media is created for this upload
          this._newEntryUploadService.onMediaCreated$
              .cancelOnDestroy(this)
              .subscribe(
                  file => {
                      this._updateFile(file.id, {entryId: file.entryId});
                  }
              );

          this._uploadManagement.onTrackedFileChanged$
              .cancelOnDestroy(this)
              .filter(trackedFile => isMonitoredUploadFile(trackedFile.data))
              .subscribe(
                  (trackedFile) => {
                      // NOTE: this service does not handle 'waitingUpload' status by design.
                      switch (trackedFile.status) {
                          case TrackedFileStatuses.added:
                              this._addFile(trackedFile);
                              break;

                          case TrackedFileStatuses.uploading:
                              const changes = {
                                  progress: trackedFile.progress,
                                  status: trackedFile.status
                              };

                              if (trackedFile.progress === 0) {
                                  this._sortUploads();
                                  Object.assign(changes, {uploadedOn: trackedFile.uploadStartAt});
                              }

                              this._updateFile(trackedFile.id, changes);

                              break;

                          case TrackedFileStatuses.uploadCompleted:
                              this._updateFile(trackedFile.id, {
                                  progress: trackedFile.progress,
                                  status: trackedFile.status
                              });

                              this._sortUploads();

                              setTimeout(() => {
                                  this._removeFile(trackedFile.id);
                              }, 5000);
                              break;

                          case TrackedFileStatuses.failure:
                              this._updateFile(trackedFile.id, {status: trackedFile.status});
                              this._sortUploads();
                              break;

                          case TrackedFileStatuses.purged:
                              this._removeFile(trackedFile.id);
                              break;

                          default:
                              break;
                      }
                  }
              )
      }else{
          this._browserService.handleUnpermittedAction(true);
      }
  }

  ngOnDestroy() {
  }

  private _filterUploadFiles(data: KalturaUploadFile): boolean {
    return data instanceof NewEntryUploadFile || data instanceof NewEntryFlavourFile;
  }

  private _updateSelectedUploadsOnRemove(fileId: string): void {
    this._selectedUploads = this._selectedUploads.filter(({ id }) => id !== fileId);
  }

  private _addFile(trackedFile: TrackedFileData): void {

    if (isMonitoredUploadFile(trackedFile.data)) {
        const fileData = trackedFile.data;

        this._uploads.push({
            id: trackedFile.id,
            entryId: fileData.entryId,
            fileName: fileData.getFileName(),
            fileSize: fileData.getFileSize(),
            mediaType: fileData.mediaType,
            status: trackedFile.status,
            uploadedOn: trackedFile.uploadStartAt,
            progress: trackedFile.progress
        });
    }
  }

  private _removeFile(id: string): void {
    const relevantFileIndex = this._uploads.findIndex(file => file.id === id);
    if (relevantFileIndex !== -1) {
      this._uploads.splice(relevantFileIndex, 1);
    }
    this._updateSelectedUploadsOnRemove(id);
  }

  private _updateFile(id, changes: Partial<UploadFileData>): void {
    const relevantFile = this._uploads.find(file => file.id === id);

    if (relevantFile) {
      Object.assign(relevantFile, changes);
    }
  }

  private _sortUploads() {
    this._uploads.sort((a, b) => {
      return this._getStatusWeight(a.status) - this._getStatusWeight(b.status);
    });
  }

  private _getStatusWeight(status: string): number {
    switch (status) {
      case TrackedFileStatuses.failure:
      case TrackedFileStatuses.uploadCompleted:
        return 0;

      case TrackedFileStatuses.uploading:
        return 1;

      case TrackedFileStatuses.added:
      case TrackedFileStatuses.preparing:
      case TrackedFileStatuses.prepared:
      case TrackedFileStatuses.pendingPrepare:
        return 2;

      default:
        return 3;
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

  public _retryUpload(file: UploadFileData): void {
    if (file.entryId) {
      this._uploadManagement.resumeUpload(file.id);
    } else {
      this._browserService.alert({
        header: this._appLocalization.get('applications.content.uploadControl.retryError.header'),
        message: this._appLocalization.get('applications.content.uploadControl.retryError.message')
      });
    }
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

