import {AppEvent} from 'app-shared/kmc-shared/app-events/app-event';

export class CaptionsUpdatedEvent extends AppEvent {

    constructor()
    {
        super('CaptionsUpdatedEvent');
    }
}
