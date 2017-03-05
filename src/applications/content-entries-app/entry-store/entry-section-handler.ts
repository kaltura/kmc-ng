import { Injectable } from '@angular/core';
import { EntryStore } from './entry-store.service';

@Injectable()
export abstract class EntrySectionHandler
{
    public constructor(store : EntryStore)
    {
        store.registerSection(this);
    }
}