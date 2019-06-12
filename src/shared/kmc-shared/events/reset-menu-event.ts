import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';

export class ResetMenuEvent extends AppEvent {

    constructor() {
        super('ResetMenuEvent');
    }
}
