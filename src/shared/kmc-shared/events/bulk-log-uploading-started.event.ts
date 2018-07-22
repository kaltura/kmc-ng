import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';
import { KalturaBatchJobStatus } from 'kaltura-ngx-client';

export class BulkLogUploadingStartedEvent extends AppEvent {
  constructor(public id: number, public status: KalturaBatchJobStatus, public uploadedOn: Date) {
    super('BulkLogUploadingStarted');
  }
}
