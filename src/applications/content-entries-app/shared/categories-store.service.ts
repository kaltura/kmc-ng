import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/multicast';

import { KalturaClient } from '@kaltura-ng/kaltura-client';


import { CategoryListAction } from 'kaltura-typescript-client/types/all';
import { KalturaCategoryFilter,KalturaFilterPager,  KalturaCategory, KalturaDetachedResponseProfile, KalturaResponseProfileType, KalturaCategoryListResponse } from 'kaltura-typescript-client/types/all'

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


@Injectable()
export class CategoriesStore {
    private _categoriesCache: {[key: string] : Observable<{items : CategoryData[]}>} = {};

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
                    observer.complete();
                },
                    err =>
                    {
                        observer.error(err);
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


        // no request found in queue - get from cache if already queried those categories
        let cachedResponse = this._categoriesCache[requestToken];

        if (!cachedResponse) {
            const categoryListRequest = this.buildCategoryListRequest({parentId, categoriesList});

            // 'multicast' function will share the observable if concurrent requests to the same parent will be executed).
            // we don't use 'share' function since it is more relevant to hot/persist origin.
            cachedResponse = categoryListRequest
                .map(response => {
                    // parse response into categories items
                    return {items : this.parseCategoriesItems(response)};
                }).catch(error => {
                    this._categoriesCache[requestToken] = null;

                    // re-throw the provided error
                    return Observable.throw(error);
                })
                .publishReplay(1)
                .refCount();
        }

        return cachedResponse;
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
