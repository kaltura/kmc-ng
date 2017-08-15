import { BrowserService } from "app-shared/kmc-shell/providers/browser.service";
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

export enum SortDirection {
    Desc,
    Asc
}

export interface QueryData {
    pageIndex?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection?: SortDirection,
    fields?: string
}

export interface QueryRequestArgs {
    data: QueryData;
}


@Injectable()
export class CategoriesService implements OnDestroy {

    private _categories = new BehaviorSubject<Categories>({ items: [], totalCount: 0 });
    private _state = new BehaviorSubject<UpdateStatus>({ loading: false, errorMessage: null });
    private _categoriesExecuteSubscription: ISubscription;
    public state$ = this._state.asObservable();
    public categories$ = this._categories.asObservable();

    private _queryData: QueryData = {
        pageIndex: 1,
        pageSize: 50,
        sortBy: 'createdAt',
        sortDirection: SortDirection.Desc,
        fields: 'id,name, createdAt, directSubCategoriesCount, entriesCount, fullName'
    };

    constructor(private _kalturaClient: KalturaClient,
        private browserService: BrowserService) {
        const defaultPageSize = this.browserService.getFromLocalStorage("categories.list.pageSize");
        if (defaultPageSize !== null) {
            this._queryData.pageSize = defaultPageSize;
        }
        this.reload(true);
    }

    public get queryData() : QueryData{
        return Object.assign({}, this._queryData);
    }

    ngOnDestroy() {
        this._state.complete();
        this._categories.complete();
        if (this._categoriesExecuteSubscription) {
            this._categoriesExecuteSubscription.unsubscribe();
        }
    }

    public reload(force: boolean): void;
    public reload(query: QueryData): void;
    public reload(query: boolean | QueryData): void {
        const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));

        if (forceReload || this._categories.getValue().totalCount === 0) {
            if (typeof query === 'object') {
                Object.assign(this._queryData, query);
            }
            this._executeQuery();
        }
    }

    private _executeQuery(): void {
        // cancel previous requests
        if (this._categoriesExecuteSubscription) {
            this._categoriesExecuteSubscription.unsubscribe();
            this._categoriesExecuteSubscription = null;
        }

        this._state.next({ loading: true, errorMessage: null });

        const queryArgs: QueryRequestArgs = Object.assign({},
            {
                data: this._queryData
            });

        this.browserService.setInLocalStorage("categories.list.pageSize", this._queryData.pageSize);

        // execute the request
        this._categoriesExecuteSubscription = this.buildQueryRequest(queryArgs).subscribe(
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
                this._state.next({ loading: false, errorMessage });
            });
    }
    private buildQueryRequest( queryData: QueryData): Observable<KalturaCategoryListResponse> {
        try {
            let filter: KalturaCategoryFilter = new KalturaCategoryFilter({});
            let pagination: KalturaFilterPager = null;
            let responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
                type: KalturaResponseProfileType.includeFields,
                fields: queryData.fields
            });

            // update pagination args
            if (queryData.pageIndex || queryData.pageSize) {
                pagination = new KalturaFilterPager(
                    {
                        pageSize: queryData.pageSize,
                        pageIndex: queryData.pageIndex
                    }
                );
            }

            // update the sort by args
            if (queryData.sortBy) {
                filter.orderBy = `${queryData.sortDirection === SortDirection.Desc ? '-' : '+'}${queryData.sortBy}`;
            }

            // build the request
            return <any>this._kalturaClient.request(
                new CategoryListAction({
                    filter,
                    pager: pagination,
                    responseProfile
                })
            )
        } catch (err) {
            return Observable.throw(err);
        }

    }
}

