import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';
import { KalturaMediaEntry } from 'kaltura-ngx-client';
import { KalturaPlaylist } from 'kaltura-ngx-client';

export class PreviewAndEmbedEvent extends AppEvent {

    constructor(public media: KalturaPlaylist | KalturaMediaEntry)
    {
        super('PreviewAndEmbedEvent');
    }
}
