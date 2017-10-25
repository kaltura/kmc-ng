import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';

export class PreviewMetadataChangedEvent extends AppEvent {

    constructor(public entryId: string)
    {
        super('PreviewMetadataChangedEvent');
    }
}