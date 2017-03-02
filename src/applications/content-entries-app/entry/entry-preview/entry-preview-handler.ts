import { Injectable, OnDestroy } from '@angular/core';
import { EntrySectionHandler } from '../../entry-store/entry-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';
import { EntryLoaded, EntryLoading } from '../../entry-store/entry-sections-events';

@Injectable()
export class EntryPreviewHandler extends EntrySectionHandler implements  OnDestroy
{
    private _eventSubscription : ISubscription;
    private _previewEntryId : BehaviorSubject<string> = new BehaviorSubject<string>(null);
    public previewEntryId$ : Observable<string> = this._previewEntryId.asObservable();

    protected _onManagerProvided(manager : EntrySectionsManager)
    {

        this._eventSubscription = manager.events$.subscribe(
            event =>
            {
                if (event instanceof EntryLoading)
                {
                    this._previewEntryId.next(event.entryId);
                }
            }
        );
    }

    ngOnDestroy()
    {
        this._eventSubscription.unsubscribe();
        this._previewEntryId.complete();
    }
}