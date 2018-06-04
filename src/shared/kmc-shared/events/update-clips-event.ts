import {AppEvent} from 'app-shared/kmc-shared/app-events/app-event';

export class UpdateClipsEvent extends AppEvent {

  constructor() {
    super('UpdateClipsEvent');
  }
}
