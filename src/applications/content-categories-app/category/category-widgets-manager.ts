import { KalturaCategory } from '@kaltura-ng/kaltura-client/api/types/KalturaCategory';
import { Injectable } from '@angular/core';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { WidgetsManagerBase } from '@kaltura-ng/kaltura-ui'
import { CategoryService } from './category.service';
import { KalturaMultiRequest } from '@kaltura-ng/kaltura-client';

@Injectable()
export class CategoryWidgetsManager extends WidgetsManagerBase<KalturaCategory, KalturaMultiRequest>
{
    private _categoryStore: CategoryService;

    constructor() {
        super();
    }

    set categoryStore(value: CategoryService) {
        this._categoryStore = value;
    }

    public returnToCategories(): void {
        if (this._categoryStore) {
            this._categoryStore.returnToCategories();
        }
    }
}
