import { Injectable, OnDestroy } from '@angular/core';
import { EntrySectionHandler } from '../../entry-store/entry-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntryStore } from '../../entry-store/entry-store.service';
import { EntryLoaded } from '../../entry-store/entry-sections-events';


@Injectable()
export class EntryCaptionsHandler extends EntrySectionHandler
{
    private _eventSubscription : ISubscription;

    constructor(store : EntryStore)
    {
        super(store);
        this._eventSubscription = store.events$.subscribe(
            event =>
            {

            }
        );
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    onSectionRemoved()
    {
        this._eventSubscription.unsubscribe();
    }
}