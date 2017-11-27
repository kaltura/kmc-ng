import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { CategoriesBulkActionBaseService } from "./categories-bulk-action-base.service";
import { CategoryUpdateAction } from "@kaltura-ng/kaltura-client/api/types/CategoryUpdateAction";
import { KalturaCategory } from '@kaltura-ng/kaltura-client/api/types/KalturaCategory';
import { KalturaAppearInListType } from "@kaltura-ng/kaltura-client/api/types/KalturaAppearInListType";

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
