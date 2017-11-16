import { Component, Input } from '@angular/core';
import { TrackedFileStatuses } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kUploadProgress',
  templateUrl: './upload-progress.component.html',
  styleUrls: ['./upload-progress.component.scss'],
})
export class UploadProgressComponent {
  @Input()
  set progress(value: number) {
    this._progress = value >= 0 ? value * 100 : 0;
  };

  @Input()
  set status(value: TrackedFileStatuses) {
    switch (value) {
      case TrackedFileStatuses.preparing:
      case TrackedFileStatuses.prepared:
      case TrackedFileStatuses.pendingPrepare:
        this._statusClass = 'pending';
        break;
      case TrackedFileStatuses.uploading:
        this._statusClass = 'uploading';
        break;
      case TrackedFileStatuses.failure:
        this._statusClass = 'uploadFailure';
        break;
      case TrackedFileStatuses.uploadCompleted:
        this._statusClass = 'uploaded';
        break;
      default:
        this._statusClass = '';
        break;
    }
  };

  public _statusClass = '';
  public _progress = 0;
}

