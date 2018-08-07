import { AppEvent } from '../app-events/app-event';

export class TranscodingProfilesUpdatedEvent extends AppEvent {
  constructor() {
    super('TranscodingProfilesUpdatedEvent');
  }
}
