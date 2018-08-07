import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaBatchJobStatus } from 'kaltura-ngx-client';

@Pipe({ name: 'kBulkLogTableStatus' })

export class BulkLogStatusPipe implements PipeTransform {

  constructor(private _appLocalization: AppLocalization) {
  }

  transform(value: number): string {
    switch (value) {
      case KalturaBatchJobStatus.pending:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.pending');

      case KalturaBatchJobStatus.queued:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.queued');

      case KalturaBatchJobStatus.processing:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.processing');

      case KalturaBatchJobStatus.finished:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.finished');

      case KalturaBatchJobStatus.aborted:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.aborted');

      case KalturaBatchJobStatus.failed:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.failed');

      case KalturaBatchJobStatus.almostDone:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.almostDone');

      case KalturaBatchJobStatus.fatal:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.fatal');

      case KalturaBatchJobStatus.retry:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.retry');

      case KalturaBatchJobStatus.dontProcess:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.dontProcess');

      case KalturaBatchJobStatus.finishedPartially:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.finishedPartially');

      default:
        return '';
    }
  }
}
