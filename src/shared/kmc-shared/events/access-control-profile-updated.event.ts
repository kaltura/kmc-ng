import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';

export class AccessControlProfileUpdatedEvent extends AppEvent {
  constructor() {
    super('AccessControlProfileUpdated');
  }
}
