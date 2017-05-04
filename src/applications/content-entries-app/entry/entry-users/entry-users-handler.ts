import { Injectable } from '@angular/core';
import { EntrySection } from '../../entry-store/entry-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';

@Injectable()
export class EntryUsersHandler extends EntrySection
{
    constructor(manager : EntrySectionsManager,
                kalturaServerClient: KalturaClient)
    {
        super(manager);
    }

    public get sectionType() : EntrySectionTypes
    {
        return EntrySectionTypes.Users;
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected _reset()
    {
    }

    protected _activate(firstLoad : boolean) {
        return undefined;
    }
}