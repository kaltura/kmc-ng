import { Injectable, } from '@angular/core';
import { EntrySection } from '../../entry-store/entry-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';

@Injectable()
export class EntryThumbnailsHandler extends EntrySection
{
    constructor(manager : EntrySectionsManager,
                kalturaServerClient: KalturaServerClient)
    {
        super(manager);
    }

    public get sectionType() : EntrySectionTypes
    {
        return EntrySectionTypes.Thumbnails;
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected reset()
    {
    }

    protected _activate(firstLoad : boolean) {
        return undefined;
    }
}