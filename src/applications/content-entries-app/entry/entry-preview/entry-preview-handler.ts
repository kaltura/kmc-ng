import { Injectable, OnDestroy } from '@angular/core';
import { EntrySectionHandler } from '../../entry-store/entry-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntryStore } from '../../entry-store/entry-store.service';
import { EntryLoaded, EntryLoading } from '../../entry-store/entry-sections-events';

@Injectable()
export class EntryPreviewHandler extends EntrySectionHandler
{
    private _eventSubscription : ISubscription;
    private _previewEntryId : BehaviorSubject<string> = new BehaviorSubject<string>(null);
    public previewEntryId$ : Observable<string> = this._previewEntryId.asObservable();

    constructor(store : EntryStore)
    {
        super(store);

        this._eventSubscription = store.events$.subscribe(
            event =>
            {
                if (event instanceof EntryLoading)
                {
                    this._previewEntryId.next(event.entryId);
                }
            }
        );
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    onSectionRemoved()
    {
        this._eventSubscription.unsubscribe();
        this._previewEntryId.complete();
    }
}