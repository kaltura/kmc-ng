import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';
import { KalturaBatchJobStatus } from '@kaltura-ng/kaltura-client/api/types/KalturaBatchJobStatus';

export class BulkLogUploadingStartedEvent extends AppEvent {
  constructor(public id: number, public status: KalturaBatchJobStatus, public uploadedOn) {
    super('BulkLogUploadingStarted');
  }
}
