import { Pipe, PipeTransform } from '@angular/core';
import { TrackedFileStatuses } from '@kaltura-ng/kaltura-common';
import { UploadFileData } from '../upload-list.component';

// TODO [kmcng] impure pipe
@Pipe({ name: 'kUploadStatusSort', pure: false })
export class UploadStatusSortPipe implements PipeTransform {
  transform(value: UploadFileData[]): UploadFileData[] {
    if (!Array.isArray(value)) {
      return value;
    }

    return value.sort((a, b) => {
      return this._getStatusWeight(a.status) - this._getStatusWeight(b.status);
    });
  }

  private _getStatusWeight(status: string): number {
    switch (status) {
      case TrackedFileStatuses.uploadFailed:
      case TrackedFileStatuses.uploadCompleted:
        return 0;

      case TrackedFileStatuses.uploading:
        return 1;

      case TrackedFileStatuses.added:
      case TrackedFileStatuses.preparing:
      case TrackedFileStatuses.waitingUpload:
        return 2;

      default:
        return 3;
    }
  }
}
