import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/share';

import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { CategoryListAction } from '@kaltura-ng2/kaltura-api/services/category';
import { KalturaCategoryFilter, KalturaCategory, KalturaDetachedResponseProfile, KalturaResponseProfileType } from '@kaltura-ng2/kaltura-api/types'

const allCategoriesFetchToken = 'all_categories';

export interface Categories{
    items : {parentId? : number, id : number, name : string, sortValue : number, fullName : string}[],
}

export type UpdateStatus = {
    loading : boolean;
    errorMessage : string;
};

@Injectable()
export class CategoriesStore {
    private _fetchingQueue: {[key: string]: ISubscription } = {};
    private _status: BehaviorSubject<UpdateStatus> = new BehaviorSubject<UpdateStatus>({
        loading: false,
        errorMessage: null
    });
    private _categories: BehaviorSubject<Categories> = new BehaviorSubject({
        items: []
    });

    public categories$: Observable<Categories> = this._categories.asObservable();

    constructor(private kalturaServerClient: KalturaServerClient) {

    }

    public getCategories(parentId?: number): void {
        const fetchingToken = parentId || allCategoriesFetchToken;

        let fetchingObservable = this._fetchingQueue[fetchingToken];
        if (!fetchingObservable) {

            const filter = new KalturaCategoryFilter();
            filter.orderBy = '+name';
            if (parentId) {
                Object.assign(filter, {parentIdEqual: parentId});
            }

            const responseProfile = new KalturaDetachedResponseProfile()
                .setData(data => {
                    data.fields = "id,name,parentId,partnerSortValue,fullName";
                    data.type = KalturaResponseProfileType.IncludeFields;
                });

            this._fetchingQueue[fetchingToken] = this.kalturaServerClient.request(
                new CategoryListAction({filter, responseProfile})
            ).subscribe(
                result =>
                {
                    this._fetchingQueue[fetchingToken] = null;

                    if (result.error)
                    {
                        // TODO [kmcng] should handle
                    }else
                    {
                        if (result.result.objects) {
                            const items = this._categories.getValue().items;

                            result.result.objects.forEach((category : KalturaCategory) =>
                            {
                               items.push({
                                   id : category.id,
                                   name : category.name,
                                   parentId : category.parentId !== 0 ? category.parentId : null,
                                   sortValue : category.partnerSortValue,
                                   fullName : category.fullName
                               });
                            });

                            this._categories.next({items: items});
                        }
                    }

                }, () =>
                {
                    this._fetchingQueue[fetchingToken] = null;
                }
            );
        }
    }
}
