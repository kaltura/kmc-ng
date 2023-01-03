import {AppEvent} from 'app-shared/kmc-shared/app-events/app-event';

export class ShowMenuEvent extends AppEvent {

    constructor()
    {
        super('ShowMenuEvent');
    }
}
