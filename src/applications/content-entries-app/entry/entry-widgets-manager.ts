import {  Injectable } from '@angular/core';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { WidgetsManagerBase } from '@kaltura-ng/kaltura-ui'
import { EntryStore } from './entry-store.service';
import { KalturaMultiRequest } from 'kaltura-ngx-client';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

@Injectable()
export class EntryWidgetsManager extends WidgetsManagerBase<KalturaMediaEntry, KalturaMultiRequest>
{
    private _entryStore : EntryStore;

    constructor(logger: KalturaLogger)
    {
        super(logger.subLogger('EntryWidgetsManager'));
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
