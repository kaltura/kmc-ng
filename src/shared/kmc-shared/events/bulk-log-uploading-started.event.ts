import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';

export class BulkLogUploadingStartedEvent extends AppEvent {
  constructor() {
    super('BulkLogUploadingStarted');
  }
}
