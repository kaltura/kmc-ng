import { Injectable } from '@angular/core';
import { FormSectionHandler, ActivateArgs } from '../../entry-store/form-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { FormSectionsManager } from '../../entry-store/form-sections-manager';

@Injectable()
export class EntryUsersHandler extends FormSectionHandler
{
    constructor(manager : FormSectionsManager,
                kalturaServerClient: KalturaServerClient)
    {
        super(manager,kalturaServerClient);
    }

    public get sectionType() : EntrySectionTypes
    {
        return EntrySectionTypes.Users;
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected reset()
    {
    }

    protected _activate(args : ActivateArgs) {
        return undefined;
    }
}