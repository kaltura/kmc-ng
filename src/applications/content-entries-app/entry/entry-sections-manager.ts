import {  Injectable } from '@angular/core';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/all';
import { EntrySectionTypes } from './entry-sections-types';
import { FormSectionsManager } from '@kaltura-ng2/kaltura-ui/form-sections'
import { EntryStore } from './entry-store.service';


@Injectable()
export class EntrySectionsManager extends FormSectionsManager<KalturaMediaEntry,EntrySectionTypes>
{
    private _entryStore : EntryStore;

    set entryStore(value : EntryStore)
    {
       this._entryStore = value;
    }

    public returnToEntries() : void{
        if (this._entryStore) {
            this._entryStore.returnToEntries();
        }
    }
}
