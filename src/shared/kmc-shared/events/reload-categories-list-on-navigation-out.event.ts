import {AppEvent} from 'app-shared/kmc-shared/app-events/app-event';

export class ReloadCategoriesListOnNavigateOutEvent extends AppEvent {
  constructor() {
    super('reload-categories-list-on-navigation-out.event.ts');
  }
}
