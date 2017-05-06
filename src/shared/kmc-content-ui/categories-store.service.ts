import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ConnectableObservable } from 'rxjs/observable/ConnectableObservable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/multicast';

import { KalturaClient } from '@kaltura-ng/kaltura-client';


import { CategoryListAction } from 'kaltura-typescript-client/types';
import { KalturaCategoryFilter,KalturaFilterPager,  KalturaCategory, KalturaDetachedResponseProfile, KalturaResponseProfileType, KalturaCategoryListResponse } from 'kaltura-typescript-client/types'

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


declare type CategoryFetchQueueType = ConnectableObservable<CategoryData[]>;


@Injectable()
export class CategoriesStore {
    private _getCategoriesRequests: {[key: string]: CategoryFetchQueueType } = {};
    private _categoriesCache: {[key: string] : CategoryData[]} = {};

    constructor(private kalturaServerClient: KalturaClient) {
    }

    public getAllCategories() : Observable<CategoriesQuery>{
        return this._getCategoriesWithCache({requestToken : 'all_categories_token'});
    }

    public getRootCategories() : Observable<CategoriesQuery>{
        return this._getCategoriesWithCache({requestToken : 'root_categories', parentId : 0});
    }

    public getCategoriesFromList(categoriesList : number[]) : Observable<CategoriesQuery>
    {
        if (categoriesList && categoriesList.length)
        {
            return this._getCategories({categoriesList});
        }else
        {
            return Observable.throw({message : 'missing categoriesList argument'});
        }
    }

    public getChildrenCategories(parentId : number) : Observable<CategoriesQuery>{

        if (parentId === null)
        {
            return Observable.throw({message : 'missing parentId argument'});
        }

        return this._getCategoriesWithCache({requestToken : parentId + '', parentId });
    }

    public getSuggestions(text:string) : Observable<{ error : {}, items : CategoryData[]}>
    {
        if (text) {
            return Observable.create(observer => {
                const filter = new KalturaCategoryFilter(
                    {
                        nameOrReferenceIdStartsWith : text,
                        orderBy : '+fullName'
                    }
                );

                const pager = new KalturaFilterPager({
                    pageIndex : 0,
                    pageSize : 30
                });

                const requestSubscription = this.kalturaServerClient.request(
                    new CategoryListAction({filter})
                ).subscribe(result =>
                {
                    const items = this.parseCategoriesItems(result);


                    observer.next({items : items});
                },
                    err =>
                    {
                        observer.error(err);
                        observer.complete();
                    });


                return () =>
                {
                    if (requestSubscription)
                    {
                        requestSubscription.unsubscribe();
                    }
                }
            });
        }else
        {
            return Observable.of({error : null, items : []});
        }
    }

    private _getCategories({parentId, categoriesList} : { parentId?: number, categoriesList? : number[] }): Observable<CategoriesQuery> {
        return this.buildCategoryListRequest({parentId, categoriesList})
            .map(response => {
                // parse response into categories items
                return {items: this.parseCategoriesItems(response)};
            });
    }

    private _getCategoriesWithCache({requestToken, parentId, categoriesList} : {requestToken : string, parentId?: number, categoriesList? : number[] }): Observable<CategoriesQuery> {

        return Observable.create(observer => {

            let fetchingObservable: CategoryFetchQueueType = this._getCategoriesRequests[requestToken];

            // get queue request from those categories if any
            if (!fetchingObservable) {

                // no request found in queue - get from cache if already queried those categories
                const cachedResponse = this._categoriesCache[requestToken];

                if (cachedResponse) {
                    fetchingObservable = <CategoryFetchQueueType>ConnectableObservable.of(cachedResponse);
                } else {
                    const categoryListRequest = this.buildCategoryListRequest({parentId, categoriesList});

                    // 'multicast' function will share the observable if concurrent requests to the same parent will be executed).
                    // we don't use 'share' function since it is more relevant to hot/persist origin.
                    fetchingObservable = this._getCategoriesRequests[requestToken] = categoryListRequest
                        .map(response => {
                            this._getCategoriesRequests[requestToken] = null;

                            // parse response into categories items
                            const retrievedItems = this.parseCategoriesItems(response);

                            // update internal state
                            this._categoriesCache[requestToken] = retrievedItems;

                            return retrievedItems;

                        }).catch(error => {
                            this._getCategoriesRequests[requestToken] = null;

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

    private buildCategoryListRequest({parentId, categoriesList} : {parentId?: number, categoriesList? : number[] }) : Observable<KalturaCategoryListResponse> {
        const filter = new KalturaCategoryFilter({});
        filter.orderBy = '+name';
        if (parentId !== null && typeof parentId !== 'undefined') {
            filter.parentIdEqual = parentId;
        }

        if (categoriesList && categoriesList.length) {
            filter.idIn = categoriesList.join(',');
        }

        const responseProfile = new KalturaDetachedResponseProfile({
            fields : "id,name,parentId,partnerSortValue,fullName,fullIds,directSubCategoriesCount",
            type : KalturaResponseProfileType.includeFields
        });

        return <any>this.kalturaServerClient.request(
            new CategoryListAction({filter, responseProfile})
        )
    }
}
