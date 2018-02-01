import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';

export class MetadataProfileUpdatedEvent extends AppEvent {
  constructor() {
    super('MetadataProfileUpdated');
  }
}
