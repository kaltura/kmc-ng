import { KalturaCategory } from 'kaltura-ngx-client';
import { Injectable } from '@angular/core';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { WidgetsManagerBase } from '@kaltura-ng/kaltura-ui'
import { CategoryService } from './category.service';
import { KalturaMultiRequest } from 'kaltura-ngx-client';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

@Injectable()
export class CategoryWidgetsManager extends WidgetsManagerBase<KalturaCategory, KalturaMultiRequest>
{
    private _categoryStore: CategoryService;

    constructor(logger: KalturaLogger) {
        super(logger.subLogger('CategoryWidgetsManager'));
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
