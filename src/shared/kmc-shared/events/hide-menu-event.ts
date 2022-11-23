import {AppEvent} from 'app-shared/kmc-shared/app-events/app-event';
import { KMCAppMenuItem } from 'app-shared/kmc-shared/kmc-views';

export class HideMenuEvent extends AppEvent {

    constructor(public onlySubMenu: boolean)
    {
        super('HidedMenuEvent');
    }
}
