import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { EntrySectionHandler } from '../../entry-store/entry-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntryLoading } from '../../entry-store/entry-sections-events';


@Injectable()
export class EntryUsersHandler extends EntrySectionHandler implements OnInit, OnDestroy
{
    private _eventSubscription : ISubscription;


    ngOnInit()
    {
        this._eventSubscription = this._manager.events$.subscribe(
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