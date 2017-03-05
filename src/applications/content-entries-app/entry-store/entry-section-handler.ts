import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { EntryStore } from './entry-store.service';


@Injectable()
export abstract class EntrySectionHandler implements OnDestroy
{
    protected _store : EntryStore;

    public setStore(store : EntryStore)
    {
        this._store = store;
        this._onStoreProvided(store);
    }

    protected abstract _onStoreProvided(store : EntryStore);
    abstract ngOnDestroy();
}