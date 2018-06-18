import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KalturaClient } from 'kaltura-ngx-client';
import { CategoriesBulkActionBaseService } from "./categories-bulk-action-base.service";
import { CategoryUpdateAction } from 'kaltura-ngx-client';
import { KalturaCategory } from 'kaltura-ngx-client';
import { KalturaAppearInListType } from 'kaltura-ngx-client';

@Injectable()
export class CategoriesBulkChangeCategoryListingService extends CategoriesBulkActionBaseService<KalturaAppearInListType> {

  constructor(_kalturaServerClient: KalturaClient) {
    super(_kalturaServerClient);
  }

  public execute(selectedCategories: KalturaCategory[], appearInListType : KalturaAppearInListType) : Observable<{}>{
    return Observable.create(observer =>{

      let requests: CategoryUpdateAction[] = [];

      selectedCategories.forEach(category => {
        let updatedCategory: KalturaCategory = new KalturaCategory();
        updatedCategory.appearInList  = appearInListType;
        requests.push(new CategoryUpdateAction({
          id: category.id,
          category: updatedCategory
        }));
      });

      this.transmit(requests, true).subscribe(
        result => {
          observer.next({})
          observer.complete();
        },
        error => {
          observer.error(error);
        }
      );
    });
  }
}
