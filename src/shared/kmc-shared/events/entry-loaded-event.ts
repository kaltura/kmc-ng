import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';
import { KalturaMediaEntry } from 'kaltura-ngx-client';

export class EntryLoadedEvent extends AppEvent {

    constructor(public media: KalturaMediaEntry) {
        super('EntryLoadedEvent');
    }
}
