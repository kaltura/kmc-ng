import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';

export class OpenEmailEvent extends AppEvent {

    constructor(public email: string, public force: boolean, public title: string, public message: string)
    {
        super('OpenEmailEvent');
    }
}
