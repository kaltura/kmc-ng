import {AppEvent} from 'app-shared/kmc-shared/app-events/app-event';

export class UpdateQuizzesEvent extends AppEvent {

  constructor() {
    super('UpdateQuizzesEvent');
  }
}
