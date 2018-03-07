import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';

export class UpdateEntriesListEvent extends AppEvent {

  constructor() {
    super('UpdateEntriesListEvent');
  }
}
