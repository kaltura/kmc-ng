import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaUser } from 'kaltura-typescript-client/types/KalturaUser';
import { CategoriesBulkActionBaseService } from "./categories-bulk-action-base.service";
import { CategoryUpdateAction } from "kaltura-typescript-client/types/CategoryUpdateAction";
import { KalturaCategory } from 'kaltura-typescript-client/types/KalturaCategory';
import { KalturaPrivacyType } from "kaltura-typescript-client/types/KalturaPrivacyType";

@Injectable()
export class CategoriesBulkChangeContentPrivacyService extends CategoriesBulkActionBaseService<KalturaPrivacyType> {

  constructor(_kalturaServerClient: KalturaClient) {
    super(_kalturaServerClient);
  }

  public execute(selectedCategories: KalturaCategory[], privacyType : KalturaPrivacyType) : Observable<{}>{
    return Observable.create(observer =>{
            let requests: CategoryUpdateAction[] = [];

      selectedCategories.forEach(category => {
        let updatedCategory: KalturaCategory = new KalturaCategory();
        updatedCategory.privacy = privacyType;
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
