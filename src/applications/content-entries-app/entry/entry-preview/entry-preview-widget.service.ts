import {Injectable, OnDestroy} from '@angular/core';
import {EntryWidget} from '../entry-widget';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

@Injectable()
export class EntryPreviewWidget extends EntryWidget implements OnDestroy {

    constructor(logger: KalturaLogger) {
        super('entryPreview', logger);
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
