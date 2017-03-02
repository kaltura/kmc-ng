import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { EntryStore } from './entry-store.service';
import { EntrySectionsManager } from './entry-sections-manager';


@Injectable()
export abstract class EntrySectionHandler implements OnDestroy
{
    protected _manager : EntrySectionsManager;

    public setManager(manager : EntrySectionsManager)
    {
        this._manager = manager;
        this._onManagerProvided(manager);
    }

    protected abstract _onManagerProvided(manager : EntrySectionsManager);
    abstract ngOnDestroy();
}