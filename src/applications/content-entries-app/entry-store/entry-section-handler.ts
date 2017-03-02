import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { EntryStore } from './entry-store.service';
import { EntrySectionsManager } from './entry-sections-manager';


@Injectable()
export abstract class EntrySectionHandler implements OnInit, OnDestroy
{
    protected _manager : EntrySectionsManager;

    public setManager(manager : EntrySectionsManager)
    {
        this._manager = manager;
    }

    abstract ngOnInit();
    abstract ngOnDestroy();
}