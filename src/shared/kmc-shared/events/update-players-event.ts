import {AppEvent} from 'app-shared/kmc-shared/app-events/app-event';

export class PlayersUpdatedEvent extends AppEvent {

    constructor(public isPlaylist: boolean)
    {
        super('PlayersUpdatedEvent');
    }
}
