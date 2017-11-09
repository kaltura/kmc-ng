import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {KalturaClient} from '@kaltura-ng/kaltura-client';
import {KalturaUser} from 'kaltura-typescript-client/types/KalturaUser';
import {CategoriesBulkActionBaseService} from './categories-bulk-action-base.service';
import {CategoryUpdateAction} from 'kaltura-typescript-client/types/CategoryUpdateAction';
import {KalturaCategory} from 'kaltura-typescript-client/types/KalturaCategory';

@Injectable()
export class CategoriesBulkChangeOwnerService extends CategoriesBulkActionBaseService<KalturaUser> {

  constructor(_kalturaServerClient: KalturaClient) {
    super(_kalturaServerClient);
  }

  public execute(selectedCategories: KalturaCategory[], owner: KalturaUser): Observable<{}>{
    return Observable.create(observer => {

      const requests: CategoryUpdateAction[] = [];

      selectedCategories.forEach(category => {
        const updatedCategory: KalturaCategory = new KalturaCategory();
        updatedCategory.owner = owner.id;
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
