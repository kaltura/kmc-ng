import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';

export class OpenEmailEvent extends AppEvent {

    constructor(public email: string, public title: string, public message: string)
    {
        super('OpenEmailEvent');
    }
}
