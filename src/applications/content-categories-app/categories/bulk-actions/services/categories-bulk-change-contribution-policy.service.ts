import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {KalturaClient} from 'kaltura-ngx-client';
import {CategoriesBulkActionBaseService} from './categories-bulk-action-base.service';
import {CategoryUpdateAction} from 'kaltura-ngx-client';
import {KalturaCategory} from 'kaltura-ngx-client';
import {KalturaContributionPolicyType} from 'kaltura-ngx-client';

@Injectable()
export class CategoriesBulkChangeContributionPolicyService extends CategoriesBulkActionBaseService<KalturaContributionPolicyType> {

  constructor(_kalturaServerClient: KalturaClient) {
    super(_kalturaServerClient);
  }

  public execute(selectedCategories: KalturaCategory[], policyType: KalturaContributionPolicyType): Observable<{}>{
    return Observable.create(observer => {

      const requests: CategoryUpdateAction[] = [];

      selectedCategories.forEach(category => {
        const updatedCategory: KalturaCategory = new KalturaCategory();
        updatedCategory.contributionPolicy = policyType;
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
