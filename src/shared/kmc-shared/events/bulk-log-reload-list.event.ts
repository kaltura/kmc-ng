import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';

export class BulkLogReloadListEvent extends AppEvent {
  constructor() {
    super('BulkLogReloadListEvent');
  }
}
