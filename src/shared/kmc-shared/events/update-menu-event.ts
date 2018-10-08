import {AppEvent} from 'app-shared/kmc-shared/app-events/app-event';
import { KMCAppMenuItem } from 'app-shared/kmc-shared/kmc-views';

export class UpdateMenuEvent extends AppEvent {

    constructor(public menu: KMCAppMenuItem[], public position: string)
    {
        super('UpdatedMenuEvent');
    }
}
