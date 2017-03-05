import { Injectable, OnDestroy } from '@angular/core';
import { EntrySectionHandler } from '../../entry-store/entry-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntryStore } from '../../entry-store/entry-store.service';
import { EntryLoaded } from '../../entry-store/entry-sections-events';

@Injectable()
export class EntryThumbnailsHandler extends EntrySectionHandler implements  OnDestroy
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

    ngOnDestroy()
    {
        this._eventSubscription.unsubscribe();
    }
}