import {  Injectable } from '@angular/core';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { FormManager } from '@kaltura-ng/kaltura-ui'
import { CategoryStoreService } from './category-store.service';
import { KalturaMultiRequest } from 'kaltura-typescript-client';

@Injectable()
export class CategoryFormManager extends FormManager<KalturaMediaEntry, KalturaMultiRequest>
{
    private _categoryStore : CategoryStoreService;

    constructor()
    {
        super();
    }

    set categoryStore(value : CategoryStoreService)
    {
       this._categoryStore = value;
    }

    public returnToEntries() : void{
        if (this._categoryStore) {
            this._categoryStore.returnToEntries();
        }
    }
}
