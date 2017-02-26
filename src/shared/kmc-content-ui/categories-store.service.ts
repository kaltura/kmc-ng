import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ConnectableObservable } from 'rxjs/observable/ConnectableObservable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/multicast';

import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { AppAuthentication } from '@kaltura-ng2/kaltura-common';

import { CategoryListAction } from '@kaltura-ng2/kaltura-api/services/category';
import { KalturaCategoryFilter,KalturaFilterPager,  KalturaCategory, KalturaDetachedResponseProfile, KalturaResponseProfileType, KalturaCategoryListResponse } from '@kaltura-ng2/kaltura-api/types'

export interface CategoryData
{
    parentId? : number,
    id : number,
    fullIdPath : number[],
    name : string,
    referenceId : string,
    sortValue : number,
    fullNamePath : string[],
    childrenCount : number
}


export interface CategoriesQuery{
    items : CategoryData[];
}


const allCategoriesFetchToken = 'all_categories_token';
declare type CategoryFetchQueueType = ConnectableObservable<CategoryData[]>;


@Injectable()
export class CategoriesStore {
    private _fetchingQueue: {[key: string]: CategoryFetchQueueType } = {};
    private categories: {[key: string] : CategoryData[]} = {};

    constructor(private kalturaServerClient: KalturaServerClient, private appAuthentication : AppAuthentication) {
    }

    public getAllCategories() : Observable<CategoriesQuery>{
        return this.getCategories();
    }

    public getRootCategories() : Observable<CategoriesQuery>{
        return this.getCategories(0);
    }

    public getChildrenCategories(parentId : number) : Observable<CategoriesQuery>{

        if (parentId === null)
        {
            throw new Error('missing parent id argument');
        }

        return this.getCategories(parentId);
    }

    public getSuggestions(text:string) : Observable<{ error : {}, items : CategoryData[]}>
    {
        if (text) {
            return Observable.create(observer => {
                const filter = new KalturaCategoryFilter();
                filter.nameOrReferenceIdStartsWith = text;
                filter.orderBy = '+fullName';

                const pager = new KalturaFilterPager();
                pager.pageIndex = 0;
                pager.pageSize = 30;


                const requestSubscription = this.kalturaServerClient.request(
                    new CategoryListAction({filter})
                ).subscribe(result =>
                {
                    const items = this.parseCategoriesItems(result);


                    observer.next({ error : null, items : items});
                },
                    err =>
                    {
                        observer.error({ error : err, items : []});
                        observer.complete();
                    });


                return () =>
                {
                    if (requestSubscription)
                    {
                        requestSubscription.unsubscribe();
                        requestSubscription;
                    }
                }
            });
        }else
        {
            return Observable.of({error : null, items : []});
        }
    }

    private getCategories(parentId?: number): Observable<CategoriesQuery> {

        return Observable.create(observer => {
            const requestToken = parentId + '' || allCategoriesFetchToken;

            let fetchingObservable: CategoryFetchQueueType = this._fetchingQueue[requestToken];

            // get queue request from those categories if any
            if (!fetchingObservable) {

                // no request found in queue - get from cache if already queried those categories
                const cachedResponse = this.categories[requestToken];

                if (cachedResponse) {
                    fetchingObservable = <CategoryFetchQueueType>ConnectableObservable.of(cachedResponse);
                } else {
                    const categoryListRequest = this.buildCategoryListRequest(parentId);

                    // 'multicast' function will share the observable if concurrent requests to the same parent will be executed).
                    // we don't use 'share' function since it is more relevant to hot/persist origin.
                    fetchingObservable = this._fetchingQueue[requestToken] = categoryListRequest
                        .map(response => {
                            this._fetchingQueue[requestToken] = null;

                            // parse response into categories items
                            const retrievedItems = this.parseCategoriesItems(response);

                            // update internal state
                            this.categories[requestToken] = retrievedItems;

                            return retrievedItems;

                        }).catch(error => {
                            this._fetchingQueue[requestToken] = null;

                            // re-throw the provided error
                            return Observable.throw(error);
                        })
                        .multicast(() => new ReplaySubject(1));

                    fetchingObservable.connect();
                }
            }

            fetchingObservable.subscribe(
                items => {
                    observer.next({
                        items : items
                    });
                }, (error) => {
                    observer.error(error);
                }
            );
        });
    }

    private parseCategoriesItems(response : KalturaCategoryListResponse) : CategoryData[]
    {
        let result = [];

        if (response && response.objects) {
            response.objects.forEach((category: KalturaCategory) => {
                const fullIdPath = (category.fullIds ? category.fullIds.split('>') : []).map((item : any) => item * 1);
                result.push({
                    id: category.id,
                    name: category.name,
                    fullIdPath : fullIdPath,
                    referenceId : category.referenceId,
                    parentId: category.parentId !== 0 ? category.parentId : null,
                    sortValue: category.partnerSortValue,
                    fullNamePath: category.fullName ? category.fullName.split('>') : [],
                    childrenCount : category.directSubCategoriesCount
                });
            });
        }

        return result;
    }

    private buildCategoryListRequest(parentId? : number) : Observable<KalturaCategoryListResponse> {
        const filter = new KalturaCategoryFilter();
        filter.orderBy = '+name';
        if (parentId !== null && typeof parentId !== 'undefined') {
            Object.assign(filter, {parentIdEqual: parentId});
        }

        const responseProfile = new KalturaDetachedResponseProfile()
            .setData(data => {
                data.fields = "id,name,parentId,partnerSortValue,fullName,directSubCategoriesCount";
                data.type = KalturaResponseProfileType.IncludeFields;
            });

        return <any>this.kalturaServerClient.request(
            new CategoryListAction({filter, responseProfile})
        )
    }
}
