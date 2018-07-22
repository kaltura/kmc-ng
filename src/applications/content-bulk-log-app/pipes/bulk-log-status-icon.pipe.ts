import { Pipe, PipeTransform } from '@angular/core';
import { KalturaBatchJobStatus } from 'kaltura-ngx-client';

@Pipe({ name: 'kBulkLogTableStatusIcon' })
export class BulkLogStatusIconPipe implements PipeTransform {
  transform(value: number): string {
    switch (value) {
      case KalturaBatchJobStatus.pending:
      case KalturaBatchJobStatus.queued:
      case KalturaBatchJobStatus.dontProcess:
        return 'kIconUpload2 kBulkLogTablePending';

      case KalturaBatchJobStatus.processing:
      case KalturaBatchJobStatus.almostDone:
        return 'kIconSync kBulkLogTableProgress';

      case KalturaBatchJobStatus.finished:
      case KalturaBatchJobStatus.finishedPartially: // waiting for icon
        return 'kIconComplete kBulkLogTableSuccess';

      case KalturaBatchJobStatus.failed:
      case KalturaBatchJobStatus.fatal:
      case KalturaBatchJobStatus.aborted: // waiting for icon
      case KalturaBatchJobStatus.retry: // waiting for icon
        return 'kIconError kBulkLogTableFailed';

      default:
        return '';
    }
  }
}
