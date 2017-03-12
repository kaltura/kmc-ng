import { Injectable, OnDestroy } from '@angular/core';
import { EntrySectionHandler, OnSectionLoadedArgs } from '../../entry-store/entry-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntryStore } from '../../entry-store/entry-store.service';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { KalturaRequest } from '@kaltura-ng2/kaltura-api';

@Injectable()
export class EntrySchedulingHandler extends EntrySectionHandler
{
    private _eventSubscription : ISubscription;

    constructor(store : EntryStore,
                kalturaServerClient: KalturaServerClient)
    {
        super(store,kalturaServerClient);

        this._eventSubscription = store.events$.subscribe(
            event =>
            {

            }
        );
    }

    public get sectionType() : EntrySectionTypes
    {
        return EntrySectionTypes.Scheduling;
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected _onSectionReset()
    {
        this._eventSubscription.unsubscribe();
    }

    protected _onSectionLoaded(data : OnSectionLoadedArgs) {
        return undefined;
    }
}