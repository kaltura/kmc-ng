import { AppEvent } from 'app-shared/kmc-shared/app-events/app-event';
import { ReachData, ReachPages } from 'app-shared/kmc-shared/reach-frame';

export class CaptionRequestEvent extends AppEvent {
    constructor(public data: ReachData, public page: ReachPages) {
        super('PreviewAndEmbedEvent');
    }
}
