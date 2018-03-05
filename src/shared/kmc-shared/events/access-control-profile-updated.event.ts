import { AppEvent } from '../app-events/app-event';

export class AccessControlProfileUpdatedEvent extends AppEvent {
  constructor() {
    super('AccessControlProfileUpdated');
  }
}
