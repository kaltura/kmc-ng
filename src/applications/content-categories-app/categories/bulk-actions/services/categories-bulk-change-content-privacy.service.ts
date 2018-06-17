import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { KalturaClient } from 'kaltura-ngx-client';
import { KalturaUser } from 'kaltura-ngx-client';
import { CategoriesBulkActionBaseService } from "./categories-bulk-action-base.service";
import { CategoryUpdateAction } from 'kaltura-ngx-client';
import { KalturaCategory } from 'kaltura-ngx-client';
import { KalturaPrivacyType } from 'kaltura-ngx-client';

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
