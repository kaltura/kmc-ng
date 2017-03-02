import { Injectable, OnDestroy } from '@angular/core';
import { EntrySectionHandler } from '../../entry-store/entry-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';
import { EntryLoaded } from '../../entry-store/entry-sections-events';

@Injectable()
export class EntryMetadataHandler extends EntrySectionHandler implements  OnDestroy
{
    private _eventSubscription : ISubscription;

    protected _onManagerProvided(manager : EntrySectionsManager)
    {
        this._eventSubscription = manager.events$.subscribe(
            event =>
            {

            }
        );
    }

    ngOnDestroy()
    {

    }

}