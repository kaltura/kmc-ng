import { Injectable, OnDestroy } from '@angular/core';
import { TrackedFileStatuses, UploadManagement } from '@kaltura-ng/kaltura-common';
import { NewEntryUploadFile } from 'app-shared/kmc-shell';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class NewUploadMonitorService implements OnDestroy {
  private _newUploadFiles: { [key: string]: { status: string } } = {};

  constructor(private _uploadManagement: UploadManagement) {

  }

  ngOnDestroy() {

  }

  private _syncNewEntryUploadTotals(): { uploading: number, queued: number, completed: number, errors: number } {
    return Object.keys(this._newUploadFiles).reduce((totals, key) => {
      const upload = this._newUploadFiles[key];
      switch (upload.status) {
        case TrackedFileStatuses.added:
        case TrackedFileStatuses.pendingPrepare:
        case TrackedFileStatuses.preparing:
        case TrackedFileStatuses.prepared:
        case TrackedFileStatuses.pendingUpload:
          return Object.assign(totals, { queued: totals.queued + 1 });
        case TrackedFileStatuses.uploading:
          return Object.assign(totals, { uploading: totals.uploading + 1 });
        case TrackedFileStatuses.uploadCompleted:
          return Object.assign(totals, { completed: totals.completed + 1 });
        case TrackedFileStatuses.failure:
          return Object.assign(totals, { errors: totals.errors + 1 });
        default:
          return totals;
      }
    }, { uploading: 0, queued: 0, completed: 0, errors: 0 });
  }

  public getTotals(): Observable<{ uploading: number, queued: number, completed: number, errors: number }> {
    return this._uploadManagement
      .onTrackedFileChanged$
      .filter(trackedFile => trackedFile.data instanceof NewEntryUploadFile)
      .map(trackedFile => {
          let relevantFile = this._newUploadFiles[trackedFile.id];
          if (!relevantFile) {
            relevantFile = { status: trackedFile.status };
            this._newUploadFiles[trackedFile.id] = relevantFile;
          } else {
            if (!([TrackedFileStatuses.cancelled, TrackedFileStatuses.purged].indexOf(trackedFile.status) !== -1
                && relevantFile.status === TrackedFileStatuses.failure)) {
              relevantFile.status = trackedFile.status;
            }
          }

          return this._syncNewEntryUploadTotals();
        }
      );
  }
}
