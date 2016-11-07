import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { KalturaAPIClient } from '@kaltura-ng2/kaltura-api';
import { CategoryService, KalturaCategoryFilter } from '@kaltura-ng2/kaltura-api/category';

import * as R from 'ramda';

export interface Categories{
    items : any[],
    loaded : boolean,
    status: string
}

@Injectable()
export class ContentCategoriesStore
{
    // TODO [KMC] - clear cached data on logout

    private _categories: BehaviorSubject<Categories> = new BehaviorSubject({items:[],loaded: false, status: ''});

    public categories$: Observable<Categories> = this._categories.asObservable();

    constructor(private kalturaAPIClient : KalturaAPIClient) {

    }


    public reloadCategories(ignoreCache: boolean = false) : Observable<boolean>
    {
        let filter;

        filter = new KalturaCategoryFilter();
        Object.assign(filter, {orderBy : '+name'});

        const cateogires = this._categories.getValue();

      if (ignoreCache || !cateogires.loaded || cateogires.status) {
        this._categories.next({items: [], loaded: false, status: ''});

        return Observable.create(observe => {
          CategoryService.list(filter)
            .execute(this.kalturaAPIClient)
            .map(function(response) {
              return response;
            })
            .subscribe(
              (response) => {
                this._categories.next({items: <any[]>response.objects, loaded: true, status: ''});
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
      }else {
        return Observable.of(true);
      }
    }

}

