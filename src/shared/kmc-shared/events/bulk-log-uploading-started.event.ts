import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';
import { KalturaBatchJobStatus } from 'kaltura-ngx-client/api/types/KalturaBatchJobStatus';
import { KalturaBulkUploadObjectType } from 'kaltura-ngx-client/api/types/KalturaBulkUploadObjectType';

export class BulkLogUploadingStartedEvent extends AppEvent {
  constructor(public id: number,
              public status: KalturaBatchJobStatus,
              public uploadedOn: Date,
              public bulkUploadObjectType: KalturaBulkUploadObjectType) {
    super('BulkLogUploadingStarted');
  }
}
