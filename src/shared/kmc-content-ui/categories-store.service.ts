import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import {KalturaServerClient} from '@kaltura-ng2/kaltura-api';
import { CategoryListAction } from '@kaltura-ng2/kaltura-api/services/category';
import { KalturaCategoryFilter, KalturaDetachedResponseProfile, KalturaResponseProfileType} from '@kaltura-ng2/kaltura-api/types'

import * as R from 'ramda';

export interface Categories{
    items : {id : string, name : string}[],
    loaded : boolean,
    status: string
}

@Injectable()
export class CategoriesStore {
    // TODO [KMC] - clear cached data on logout

    private _categories: BehaviorSubject<Categories> = new BehaviorSubject({
        items: [],
        loaded: false,
        status: ''
    });
    public categories$: Observable<Categories> = this._categories.asObservable();

    constructor(private kalturaServerClient: KalturaServerClient) {

    }

    public reloadCategories(): void {
        return Observable.create(observe => {

            const filter = new KalturaCategoryFilter();
            filter.orderBy = '+name';

            const responseProfile = new KalturaDetachedResponseProfile()
                .setData(data => {
                    data.fields = "id,name,parentId,xsd,views";
                    data.type = KalturaResponseProfileType.IncludeFields;
                });

            this.kalturaServerClient.request(
                new CategoryListAction({filter, responseProfile})
            )
                .subscribe(
                    (response) => {
                        this._categories.next({
                            items: <Category[]>categories,
                            map: categoriesMap,
                            loaded: true,
                            status: ''
                        });
                        observe.next(true);
                        observe.complete();
                    },
                    () => {
                        // TODO [KMC]: handle error
                        observe.next(false);
                        observe.complete();
                    }
                )
        });

    }
}

