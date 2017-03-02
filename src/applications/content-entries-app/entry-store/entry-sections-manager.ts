import {  OnInit, OnDestroy } from '@angular/core';
import { EntrySectionHandler } from './entry-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { EntryEvents } from './entry-sections-events';


export class EntrySectionsManager implements OnDestroy{

    private _events : Subject<EntryEvents> = new Subject<EntryEvents>();
    public events$ = this._events.asObservable();
    private _notifyEventSubscription : ISubscription;

    constructor(private _notifyEvent$ : Observable<EntryEvents>,  public sections : EntrySectionHandler[])
    {
        if (_notifyEvent$)
        {
            this._notifyEventSubscription = _notifyEvent$.subscribe(
                event =>
                {
                    this._events.next(event);
                }
            )
        }

        if (sections)
        {
            sections.forEach(section =>
            {
                section.setManager(this);
            });
        }
    }

    ngOnDestroy()
    {
        this._notifyEventSubscription.unsubscribe();
    }
}