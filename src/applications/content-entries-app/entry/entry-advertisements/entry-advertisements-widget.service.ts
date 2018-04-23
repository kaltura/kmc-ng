import {Injectable, OnDestroy} from '@angular/core';
import {EntryWidget} from '../entry-widget';

@Injectable()
export class EntryAdvertisementsWidget extends EntryWidget implements OnDestroy {

    constructor() {
        super('entryAdvertisements');
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset() {
    }

    ngOnDestroy() {
    }

    protected onActivate(firstTimeActivating: boolean) {
    }
}
