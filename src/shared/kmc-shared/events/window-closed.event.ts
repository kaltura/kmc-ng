import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';
import { KalturaBatchJobStatus } from 'kaltura-ngx-client';

export class WindowClosedEvent extends AppEvent {
  constructor(public window: string) {
    super('WindowClosed');
  }
}
