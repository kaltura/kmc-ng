import { Component, Input, OnDestroy } from '@angular/core';
import { TrackedFileStatuses, UploadManagement } from '@kaltura-ng/kaltura-common';
import { NewEntryUploadFile } from 'app-shared/kmc-shell';

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

  private _newUploadFiles: { id: string, status: string }[] = [];
  public _menuOpened = false;
  public _upToDate = true;
  public _uploadFromDesktop: UploadMonitorStatuses = {
    uploading: 0,
    queued: 0,
    completed: 0,
    errors: 0,
  };

  constructor(private _uploadManagement: UploadManagement) {
    this._monitorNewEntryUploadFilesChanges();
  }

  ngOnDestroy() {
  }

  private _checkUpToDate(): void {
    const uploadFromDesktop = this._uploadFromDesktop.uploading + this._uploadFromDesktop.queued;
    this._upToDate = !uploadFromDesktop;
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
          let relevantFile = this._newUploadFiles.find(({ id }) => id === trackedFile.id);
          if (!relevantFile) {
            relevantFile = { id: trackedFile.id, status: trackedFile.status };
            this._newUploadFiles.push(relevantFile);
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
}

