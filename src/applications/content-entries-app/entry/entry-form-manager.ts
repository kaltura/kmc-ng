import {  Injectable } from '@angular/core';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { FormManager } from '@kaltura-ng/kaltura-ui'
import { EntryStore } from './entry-store.service';

@Injectable()
export class EntryFormManager extends FormManager<KalturaMediaEntry>
{
    private _entryStore : EntryStore;

    constructor()
    {
        super();
    }

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
