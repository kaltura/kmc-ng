import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';

export class ClearEntriesSelectionEvent extends AppEvent {

    constructor() {
        super('ClearEntriesSelectionEvent');
    }
}
