import { KalturaCategoryFilter } from 'kaltura-typescript-client/types/KalturaCategoryFilter';
import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';

import { KalturaDetachedResponseProfile } from 'kaltura-typescript-client/types/KalturaDetachedResponseProfile';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaResponseProfileType } from 'kaltura-typescript-client/types/KalturaResponseProfileType';
import { CategoryListAction } from 'kaltura-typescript-client/types/CategoryListAction';

import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaCategoryListResponse } from "kaltura-typescript-client/types/KalturaCategoryListResponse";
import { KalturaCategory } from "kaltura-typescript-client/types/KalturaCategory";

export type UpdateStatus = {
    loading: boolean;
    errorMessage: string;
};

export interface Categories {
    items: KalturaCategory[],
    totalCount: number
}

@Injectable()
export class CategoriesService implements OnDestroy {

    private _categories = new BehaviorSubject<Categories>({ items: [], totalCount: 0 });
    private _state = new BehaviorSubject<UpdateStatus>({ loading: false, errorMessage: null });
    private _categoriesExecuteSubscription: ISubscription;
    public state$ = this._state.asObservable();
    public categories$ = this._categories.asObservable();

    constructor(private _kalturaClient: KalturaClient) {
        this.reload();
    }

    ngOnDestroy() {
        this._state.complete();
        this._categories.complete();
        if (this._categoriesExecuteSubscription) {
            this._categoriesExecuteSubscription.unsubscribe();
        }
    }

    public reload(): void {
        this._executeQuery();
    }

    private _executeQuery(): void {
        // cancel previous requests
        if (this._categoriesExecuteSubscription) {
            this._categoriesExecuteSubscription.unsubscribe();
            this._categoriesExecuteSubscription = null;
        }

        this._state.next({ loading: true, errorMessage: null });

        // execute the request
        this._categoriesExecuteSubscription = this.buildQueryRequest().subscribe(
            response => {
                this._categoriesExecuteSubscription = null;

                this._state.next({ loading: false, errorMessage: null });

                this._categories.next({
                    items: response.objects,
                    totalCount: <number>response.totalCount
                });
            },
            error => {
                this._categoriesExecuteSubscription = null;
                const errorMessage = error & error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
                this._state.next({loading: false, errorMessage});                
            });
    }

    private buildQueryRequest(): Observable<KalturaCategoryListResponse> {

        try {
            let filter: KalturaCategoryFilter = new KalturaCategoryFilter({});
            let responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
                type: KalturaResponseProfileType.includeFields,
                fields: 'id,name, createdAt, directSubCategoriesCount, entriesCount, fullName'
            });
            let pager: KalturaFilterPager = new KalturaFilterPager({ pageSize: 50, pageIndex: 1 });

            // build the request
            return <any>this._kalturaClient.request(
                new CategoryListAction({
                    filter,
                    pager,
                    responseProfile
                })
            )
        } catch (err) {
            return Observable.throw(err);
        }

    }
}

