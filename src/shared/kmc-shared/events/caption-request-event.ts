import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';
import { ReachData } from 'app-shared/kmc-shared/reach-frame';
import { ReachPages } from 'app-shared/kmc-shared/kmc-views/details-views';

export class CaptionRequestEvent extends AppEvent {
    constructor(public data: ReachData, public page: ReachPages) {
        super('CaptionRequestEvent');
    }
}
