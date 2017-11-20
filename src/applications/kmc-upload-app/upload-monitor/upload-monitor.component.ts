import { Component, Input, OnDestroy } from '@angular/core';
import { RequestFactory, TrackedFileStatuses, UploadManagement } from '@kaltura-ng/kaltura-common';
import { BrowserService, NewEntryUploadFile } from 'app-shared/kmc-shell';
import { KalturaServerPolls } from '@kaltura-ng/kaltura-server-utils/server-polls';
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { BulkListAction } from 'kaltura-typescript-client/types/BulkListAction';
import { KalturaBulkUploadFilter } from 'kaltura-typescript-client/types/KalturaBulkUploadFilter';
import { KalturaBatchJobStatus } from 'kaltura-typescript-client/types/KalturaBatchJobStatus';
import { KalturaBulkUploadListResponse } from 'kaltura-typescript-client/types/KalturaBulkUploadListResponse';

interface UploadMonitorStatuses {
  uploading: number;
  queued: number;
  completed: number;
  errors: number;
}

@Component({
  selector: 'kUploadMonitor',
  templateUrl: './upload-monitor.component.html',
  styleUrls: ['./upload-monitor.component.scss'],
})
export class UploadMonitorComponent implements OnDestroy {
  @Input() appmenu;
  public _menuOpened = false;
  public _upToDate = true;
  public _uploadFromDesktop: UploadMonitorStatuses = {
    uploading: 0,
    queued: 0,
    completed: 0,
    errors: 0,
  };
  public _bulkUpload: UploadMonitorStatuses = {
    uploading: 0,
    queued: 0,
    completed: 0,
    errors: 0,
  };
  private _newUploadFiles: { [key: string]: { status: string } } = {};
  private _bulkUploadFiles: { [key: string]: { status: KalturaBatchJobStatus, newUpload?: boolean } } = {};

  constructor(private _uploadManagement: UploadManagement,
              private _serverPolls: KalturaServerPolls,
              private _browserService: BrowserService) {
    this._monitorNewEntryUploadFilesChanges();
    this._monitorBulkUploadChanges();
  }

  ngOnDestroy() {
  }

  private _checkUpToDate(): void {
    const uploadFromDesktop = this._uploadFromDesktop.uploading + this._uploadFromDesktop.queued;
    const bulkUpload = this._bulkUpload.uploading + this._bulkUpload.queued;
    this._upToDate = !uploadFromDesktop && !bulkUpload;
  }

  private _increaseParam(objectName: string, paramName: string): void {
    const newValue = this[objectName][paramName] + 1;
    this[objectName] = Object.assign({}, this[objectName], { [paramName]: newValue });
    this._checkUpToDate();
  }

  private _decreaseParam(objectName: string, paramName: string): void {
    const newValue = this[objectName][paramName] - 1;
    this[objectName] = Object.assign({}, this[objectName], { [paramName]: newValue >= 0 ? newValue : 0 });
    this._checkUpToDate();
  }

  private _monitorNewEntryUploadFilesChanges(): void {
    this._uploadManagement.onTrackedFileChanged$
      .cancelOnDestroy(this)
      .filter(trackedFile => trackedFile.data instanceof NewEntryUploadFile)
      .subscribe(
        trackedFile => {
          let relevantFile = this._newUploadFiles[trackedFile.id];
          if (!relevantFile) {
            relevantFile = { status: trackedFile.status };
            this._newUploadFiles[trackedFile.id] = relevantFile;
          }

          switch (trackedFile.status) {
            case TrackedFileStatuses.added:
              relevantFile.status = TrackedFileStatuses.added;
              this._increaseParam('_uploadFromDesktop', 'queued');
              break;
            case TrackedFileStatuses.uploading:
              if (relevantFile.status !== TrackedFileStatuses.uploading) {
                relevantFile.status = TrackedFileStatuses.uploading;
                this._increaseParam('_uploadFromDesktop', 'uploading');
                this._decreaseParam('_uploadFromDesktop', 'queued');
              }
              break;
            case TrackedFileStatuses.uploadCompleted:
              relevantFile.status = TrackedFileStatuses.uploadCompleted;
              this._increaseParam('_uploadFromDesktop', 'completed');
              this._decreaseParam('_uploadFromDesktop', 'uploading');
              break;
            case TrackedFileStatuses.failure:
              this._increaseParam('_uploadFromDesktop', 'errors');
              if (relevantFile.status === TrackedFileStatuses.uploading) {
                this._decreaseParam('_uploadFromDesktop', 'uploading');
              } else if (relevantFile.status === TrackedFileStatuses.added) {
                this._decreaseParam('_uploadFromDesktop', 'queued');
              }

              relevantFile.status = TrackedFileStatuses.failure;
              break;
            case TrackedFileStatuses.purged:
              if (relevantFile.status === TrackedFileStatuses.uploading) {
                this._decreaseParam('_uploadFromDesktop', 'uploading');
              } else if (relevantFile.status === TrackedFileStatuses.added) {
                this._decreaseParam('_uploadFromDesktop', 'queued');
              } else if (relevantFile.status === TrackedFileStatuses.failure) {
                this._decreaseParam('_uploadFromDesktop', 'errors');
              }
              break;
            default:
              break;
          }
        }
      );
  }

  private _monitorBulkUploadChanges(): void {
    this._serverPolls
      .register(10, new BulkLogUploadChanges(this._browserService.sessionStartedAt))
      .cancelOnDestroy(this)
      .subscribe(([progressing, completed]) => {
        this._handleProgressingBulkUploads(progressing.result);
        this._handleCompletedBulkUploads(completed.result);
      });
  }

  private _handleProgressingBulkUploads(response: KalturaBulkUploadListResponse): void {
    response.objects.forEach(item => {
      let relevantUpload = this._bulkUploadFiles[item.id];

      if (!relevantUpload) {
        relevantUpload = { status: item.status, newUpload: true };
        this._bulkUploadFiles[item.id] = relevantUpload;
      } else {
        relevantUpload.newUpload = false;
      }

      switch (item.status) {
        case KalturaBatchJobStatus.pending:
        case KalturaBatchJobStatus.queued:
          if (relevantUpload.newUpload) {
            this._increaseParam('_bulkUpload', 'queued');
          }
          break;

        case KalturaBatchJobStatus.processing:
        case KalturaBatchJobStatus.almostDone:
        case KalturaBatchJobStatus.retry:
          if (relevantUpload.newUpload) {
            this._increaseParam('_bulkUpload', 'uploading');
          } else if (relevantUpload.status !== item.status) {
            relevantUpload.status = item.status;
            this._increaseParam('_bulkUpload', 'uploading');
            this._decreaseParam('_bulkUpload', 'queued');
          }
          break;

        default:
          break;
      }
    });
  }

  private _handleCompletedBulkUploads(response: KalturaBulkUploadListResponse): void {
    response.objects.forEach(item => {
      let relevantUpload = this._bulkUploadFiles[item.id];

      if (!relevantUpload) {
        relevantUpload = { status: item.status, newUpload: true };
        this._bulkUploadFiles[item.id] = relevantUpload;
      } else {
        relevantUpload.newUpload = false;
      }

      switch (item.status) {
        case KalturaBatchJobStatus.finishedPartially:
        case KalturaBatchJobStatus.finished:
        case KalturaBatchJobStatus.processed:
          if (relevantUpload.newUpload) {
            this._increaseParam('_bulkUpload', 'completed');
          } else if (relevantUpload.status !== item.status) {
            this._increaseParam('_bulkUpload', 'completed');

            if ([KalturaBatchJobStatus.pending, KalturaBatchJobStatus.queued].indexOf(relevantUpload.status) !== -1) {
              this._decreaseParam('_bulkUpload', 'queued');
            } else {
              this._decreaseParam('_bulkUpload', 'uploading');
            }

            relevantUpload.status = item.status;
          }
          break;

        case KalturaBatchJobStatus.failed:
        case KalturaBatchJobStatus.fatal:
        case KalturaBatchJobStatus.aborted:
        case KalturaBatchJobStatus.dontProcess:
        case KalturaBatchJobStatus.movefile:
          if (relevantUpload.newUpload) {
            this._increaseParam('_bulkUpload', 'errors');
          } else if (relevantUpload.status !== item.status) {
            this._increaseParam('_bulkUpload', 'errors');

            if ([KalturaBatchJobStatus.pending, KalturaBatchJobStatus.queued].indexOf(relevantUpload.status) !== -1) {
              this._decreaseParam('_bulkUpload', 'queued');
            } else {
              this._decreaseParam('_bulkUpload', 'uploading');
            }

            relevantUpload.status = item.status;
          }
          break;

        default:
          break;
      }
    });
  }
}


export class BulkLogUploadChanges implements RequestFactory<KalturaMultiRequest> {
  constructor(private _sessionStartedAt: Date) {
  }

  create(): KalturaMultiRequest {
    const processingStatusId = [
      KalturaBatchJobStatus.pending,
      KalturaBatchJobStatus.queued,
      KalturaBatchJobStatus.processing,
      KalturaBatchJobStatus.almostDone,
      KalturaBatchJobStatus.retry
    ];
    const processingBulkUpload = new BulkListAction({
      bulkUploadFilter: new KalturaBulkUploadFilter({
        statusIn: processingStatusId.join(','),
        bulkUploadObjectTypeIn: '1,2,3,4',
      })
    });

    const finishedStatusId = [
      KalturaBatchJobStatus.finished,
      KalturaBatchJobStatus.finishedPartially,
      KalturaBatchJobStatus.processed,
      KalturaBatchJobStatus.failed,
      KalturaBatchJobStatus.fatal,
      KalturaBatchJobStatus.aborted,
      KalturaBatchJobStatus.dontProcess,
      KalturaBatchJobStatus.movefile,
    ];
    const finishedBulkUpload = new BulkListAction({
      bulkUploadFilter: new KalturaBulkUploadFilter({
        statusIn: finishedStatusId.join(','),
        bulkUploadObjectTypeIn: '1,2,3,4',
        uploadedOnGreaterThanOrEqual: this._sessionStartedAt
      })
    });

    return new KalturaMultiRequest(
      processingBulkUpload,
      finishedBulkUpload
    );
  }
}
