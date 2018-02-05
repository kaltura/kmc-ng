import {AppEvent} from 'shared/kmc-shared/app-events/app-event';
import {KalturaMediaEntry} from 'kaltura-ngx-client/api/types/KalturaMediaEntry';

export interface CreateNewCategoryEventArgs {
  entries: KalturaMediaEntry[]
}

export class CreateNewCategoryEvent extends AppEvent {
  constructor(public data: CreateNewCategoryEventArgs) {
    super('CreateNewCategory');
  }
}
