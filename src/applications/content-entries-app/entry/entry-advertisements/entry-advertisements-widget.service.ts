import {Injectable, OnDestroy} from '@angular/core';
import {EntryWidget} from '../entry-widget';
import { ContentEntryViewSections } from 'app-shared/kmc-shared/kmc-views/details-views/content-entry-view.service';
import { EntryStore } from '../entry-store.service';

@Injectable()
export class EntryAdvertisementsWidget extends EntryWidget implements OnDestroy {

    constructor() {
        super(ContentEntryViewSections.Advertisements);
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
