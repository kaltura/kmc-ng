import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import {KalturaServerClient} from '@kaltura-ng2/kaltura-api';
import { CategoryListAction } from '@kaltura-ng2/kaltura-api/services/category';
import { KalturaCategoryFilter, KalturaDetachedResponseProfile, KalturaResponseProfileType} from '@kaltura-ng2/kaltura-api/types'

import * as R from 'ramda';

export interface Categories{
    items : Category[],
    map: any,
    loaded : boolean,
    status: string
}

export class Category {
  id = "";
  label = "";
  parentId = "";
  children = [];

  constructor(id: string, label: string, parentId: string){
    this.id = id;
    this.label = label;
    this.parentId = parentId;
  }
}

@Injectable()
export class ContentCategoriesStore
{
    // TODO [KMC] - clear cached data on logout

    private _categories: BehaviorSubject<Categories> = new BehaviorSubject({items: [], map: {}, loaded: false, status: ''});
    public categories$: Observable<Categories> = this._categories.asObservable();

    constructor(private kalturaServerClient :KalturaServerClient) {

    }

    public reloadCategories(ignoreCache: boolean = false) : Observable<boolean>
    {


        const categories = this._categories.getValue();

      if (ignoreCache || !categories.loaded || categories.status) {
        let categoriesMap = {};

        this._categories.next({items: [], map: {}, loaded: false, status: ''});

        const filter = new KalturaCategoryFilter();
        filter.orderBy = '+name';

        const responseProfile = new KalturaDetachedResponseProfile()
          .setData( data => {
            data.fields = "id,name,xsd,views";
            data.type = KalturaResponseProfileType.IncludeFields;
          });

        return Observable.create(observe => {

          this.kalturaServerClient.request(
            new CategoryListAction({filter, responseProfile})
          )
            .map((response: any) => {
              if (response && response.objects){
                const categoriesData = this.buildCategoriesHyrarchy(response.objects);
                categoriesMap = categoriesData.categoriesMap;
                return categoriesData.rootLevel;
              }else{
                return [];
              }
            })
            .subscribe(
              (categories: Category[]) => {
                this._categories.next({items: <Category[]>categories, map: categoriesMap, loaded: true, status: ''});
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


  buildCategoriesHyrarchy(categories: any[]) : { rootLevel : Category[], categoriesMap: {[categoryID: string]: Category}} {
    // convert flat array to hyrarchial data array
    let allCategories = [];
    let rootLevel = [];
    let categoriesMap = {};

    categories.sort(function(a,b) {return (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) ? 1 : ((b.name.toLocaleLowerCase() > a.name.toLocaleLowerCase()) ? -1 : 0);} );

    categories.forEach(function(category: any) {
      let cat = new Category(category.id, category.name, category.parentId);
      categoriesMap[category.id] = cat;
      allCategories.push(cat);
    }, this);

    allCategories.forEach(function(category: Category) {
      if (category.parentId == "0"){
        rootLevel.push(category);
      }else{
        categoriesMap[category.parentId].children.push(category);
      }
    }, this);

    return {rootLevel: rootLevel, categoriesMap: categoriesMap};
  }

}

