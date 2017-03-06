import { Host, Injectable, OnDestroy } from '@angular/core';
import { EntryStore } from './entry-store.service';
import { KalturaMediaEntry } from '@kaltura-ng2/kaltura-api/types';

@Injectable()
export abstract class EntrySectionHandler implements OnDestroy
{
    public entry : KalturaMediaEntry;

    public constructor(@Host() public store : EntryStore)
    {
        store.registerSection(this);

        store.entry$.subscribe(entry =>
        {
            this.entry = entry;
        });
    }

    ngOnDestroy()
    {
        this.onSectionRemoved();
    }

    abstract onSectionRemoved();

}