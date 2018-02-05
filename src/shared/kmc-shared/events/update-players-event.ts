import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';

export class UpdatePlayersEvent extends AppEvent {

    constructor(public isPlaylist: boolean)
    {
        super('UpdatePlayersEvent');
    }
}