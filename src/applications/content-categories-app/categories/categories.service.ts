import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {KalturaCategoryFilter} from 'kaltura-typescript-client/types/KalturaCategoryFilter';
import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {ISubscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import {KalturaDetachedResponseProfile} from 'kaltura-typescript-client/types/KalturaDetachedResponseProfile';
import {KalturaFilterPager} from 'kaltura-typescript-client/types/KalturaFilterPager';
import {KalturaResponseProfileType} from 'kaltura-typescript-client/types/KalturaResponseProfileType';
import {CategoryListAction} from 'kaltura-typescript-client/types/CategoryListAction';
import {KalturaClient} from '@kaltura-ng/kaltura-client';
import {KalturaCategoryListResponse} from 'kaltura-typescript-client/types/KalturaCategoryListResponse';
import {KalturaCategory} from 'kaltura-typescript-client/types/KalturaCategory';
import {CategoryDeleteAction} from 'kaltura-typescript-client/types/CategoryDeleteAction';

export interface UpdateStatus {
    loading: boolean;
    errorMessage: string;
}

export interface Categories {
    items: KalturaCategory[],
    totalCount: number
}

export enum SortDirection {
    Desc,
    Asc
}

export interface QueryData {
    pageIndex: number,
    pageSize: number,
    sortBy: string,
    sortDirection: SortDirection,
    fields: string
}

export interface NewCategoryData {
    parentCategoryId: number;
}

@Injectable()
export class CategoriesService implements OnDestroy {

    private _categories = new BehaviorSubject<Categories>({ items: [], totalCount: 0 });
    private _state = new BehaviorSubject<UpdateStatus>({ loading: false, errorMessage: null });
    private _categoriesExecuteSubscription: ISubscription;
    private _queryData = new BehaviorSubject<QueryData>({
        pageIndex: 1,
        pageSize: 50,
        sortBy: 'createdAt',
        sortDirection: SortDirection.Desc,
        fields: 'id,name, createdAt, directSubCategoriesCount, entriesCount, fullName,tags'
    });

    public state$ = this._state.asObservable();
    public categories$ = this._categories.asObservable();
    public queryData$ = this._queryData.asObservable();
    private _newCategoryData: NewCategoryData = null;

    constructor(private _kalturaClient: KalturaClient,
        private browserService: BrowserService) {
        const defaultPageSize = this.browserService.getFromLocalStorage('categories.list.pageSize');
        if (defaultPageSize !== null) {
            this._updateQueryData({
                pageSize: defaultPageSize
            });
        }
        this.reload(false);
    }

    ngOnDestroy() {
        this._state.complete();
        this._queryData.complete();
        this._categories.complete();
        if (this._categoriesExecuteSubscription) {
            this._categoriesExecuteSubscription.unsubscribe();
            this._categoriesExecuteSubscription = null;
        }
    }

    public reload(force: boolean): void;
    public reload(query: Partial<QueryData>): void;
    public reload(query: boolean | Partial<QueryData>): void {
        const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));

        if (forceReload || this._categories.getValue().totalCount === 0) {
            if (typeof query === 'object') {
                this._updateQueryData(query);
            }
            this._executeQuery();
        }
    }

    private _updateQueryData(partialData: Partial<QueryData>): void {
        const newQueryData = Object.assign({}, this._queryData.getValue(), partialData);
        this._queryData.next(newQueryData);

        if (partialData.pageSize) {
            this.browserService.setInLocalStorage('categories.list.pageSize', partialData.pageSize);
        }
    }

    public getNextCategoryId(categoryId: number): number | null {
        const categories = this._categories.getValue().items;
        if (!categories || !categories.length) {
          return null;
        }

        // validate category exists
        const currentCategoryIndex = categories.findIndex(category => category.id === categoryId);
        if (currentCategoryIndex === -1) {
            return null;
        }

        // get next category ID
        if (currentCategoryIndex < categories.length - 1) {
            return (categories[currentCategoryIndex + 1].id);
        } else {
            return null;
        }
    }

    public getPrevCategoryId(categoryId: number): number | null {
        const categories = this._categories.getValue().items;
        if (!categories || !categories.length) {
          return null;
        }

        // validate category exists
        const currentCategoryIndex = categories.findIndex(category => category.id === categoryId);
        if (currentCategoryIndex === -1) {
            return null;
        }

        // get previous category ID
        if (currentCategoryIndex !== 0) {
            return (categories[currentCategoryIndex - 1].id);
        } else {
            return null;
        }
    }

    private _executeQuery(): void {
        // cancel previous requests
        if (this._categoriesExecuteSubscription) {
            this._categoriesExecuteSubscription.unsubscribe();
        }

        this._state.next({ loading: true, errorMessage: null });

        // execute the request
        this._categoriesExecuteSubscription = this.buildQueryRequest(this._queryData.getValue()).subscribe(
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
                const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
                this._state.next({ loading: false, errorMessage });
            });
    }

    private buildQueryRequest(queryData: QueryData): Observable<KalturaCategoryListResponse> {
        try {
            const filter: KalturaCategoryFilter = new KalturaCategoryFilter({});
            let pagination: KalturaFilterPager = null;
            const responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
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
            );
        } catch (err) {
            return Observable.throw(err);
        }

    }

    public deleteCategory(categoryId: number): Observable<void> {

        return Observable.create(observer => {
            let subscription: ISubscription;
            if (categoryId && categoryId > 0) {
                subscription = this._kalturaClient.request(new CategoryDeleteAction({ id: categoryId })).subscribe(
                    result => {
                        observer.next();
                        observer.complete();
                    },
                    error => {
                        observer.error(error);
                    }
                );
            } else {
                observer.error(new Error('missing categoryId argument'));
            }
            return () => {
                if (subscription) {
                    subscription.unsubscribe();
                }
            }
        });
    }

    public setNewCategoryData(newCategoryData: NewCategoryData) {
        this._newCategoryData = newCategoryData;
    }

    public getNewCategoryData(): NewCategoryData {
        return this._newCategoryData;
    }

    public clearNewCategoryData(): void {
        this._newCategoryData = null
    }
}

