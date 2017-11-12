import {  Injectable } from '@angular/core';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { WidgetsManagerBase } from '@kaltura-ng/kaltura-ui'
import { EntryStore } from './entry-store.service';
import { KalturaMultiRequest } from 'kaltura-typescript-client';

@Injectable()
export class EntryWidgetsManager extends WidgetsManagerBase<KalturaMediaEntry, KalturaMultiRequest>
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
