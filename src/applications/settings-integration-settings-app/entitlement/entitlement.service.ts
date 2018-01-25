import {Injectable, OnDestroy} from '@angular/core';
import {KalturaClient, KalturaMultiRequest} from 'kaltura-ngx-client';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {Observable} from 'rxjs/Observable';
import {CategoryListAction} from 'kaltura-ngx-client/api/types/CategoryListAction';
import {KalturaCategoryFilter} from 'kaltura-ngx-client/api/types/KalturaCategoryFilter';
import {PartnerGetInfoAction} from 'kaltura-ngx-client/api/types/PartnerGetInfoAction';
import {KalturaPrivacyType} from 'kaltura-ngx-client/api/types/KalturaPrivacyType';
import {KalturaContributionPolicyType} from 'kaltura-ngx-client/api/types/KalturaContributionPolicyType';
import {KalturaAppearInListType} from 'kaltura-ngx-client/api/types/KalturaAppearInListType';
import {CategoryUpdateAction} from 'kaltura-ngx-client/api/types/CategoryUpdateAction';
import { CategoryGetAction } from 'kaltura-ngx-client/api/types/CategoryGetAction';

export interface EntitlementSectionData {
  categories: KalturaCategory[];
  partnerDefaultEntitlementEnforcement: boolean
}

@Injectable()
export class EntitlementService implements OnDestroy{

  constructor(private _kalturaServerClient: KalturaClient) {
  }

  public getEntitlementsSectionData(): Observable<EntitlementSectionData> {

    const request = new KalturaMultiRequest(
      new PartnerGetInfoAction(),
      new CategoryListAction({
        filter: new KalturaCategoryFilter({
          privacyContextEqual: '*'
        })
      })
    );

    return this._kalturaServerClient.multiRequest(request).cancelOnDestroy(this).map(
      response => {
        if (response.hasErrors()) {
          throw new Error('error occurred in action \'getEntitlementsSectionData\'');
        }

        const partnerDefaultEntitlementEnforcement: boolean = response[0].result.defaultEntitlementEnforcement;
        const categories: KalturaCategory[] = response[1].result.objects;
        return {categories, partnerDefaultEntitlementEnforcement};
      }
    );
  }

  public deleteEntitlement({id, privacyContextData}: { id: number, privacyContextData?: { privacyContext: string, privacyContexts: string } }): Observable<void> {
    if (!id) {
      return Observable.throw(new Error('Error occurred while trying to delete entitlement'));
    }

    const category = new KalturaCategory();
    category.privacyContext = null;

    if (privacyContextData !== null && typeof privacyContextData !== "undefined") {
      const context = (privacyContextData && privacyContextData.privacyContext.split(',')) || [];
      const contexts = (privacyContextData && privacyContextData.privacyContexts.split(',')) || [];

      // Subtract privacyContext from privacyContexts and if no contexts left so set the following properties
      context.forEach( ctx => {
        for (let i = contexts.length - 1; i >= 0; i--) {
          if(contexts[i] === ctx) {
            contexts.splice(i, 1);
          }
        }
      });

      if (contexts.length) {
        category.privacy = KalturaPrivacyType.all;
        category.appearInList = KalturaAppearInListType.partnerOnly;
        category.contributionPolicy = KalturaContributionPolicyType.all;
      }
    }

    return this._kalturaServerClient.request(new CategoryUpdateAction({
      id,
      category
    }))
      .map(_ => (undefined));
  }

  public addEntitlement({id, privacyContext}: { id: number, privacyContext: string }): Observable<void> {
    if (!id || !privacyContext) {
      return Observable.throw(new Error('Error occurred while trying to add entitlement, invalid entitlement\'s data'));
    }

    const category = new KalturaCategory({
      privacyContext
    });

    return this._kalturaServerClient.request(new CategoryUpdateAction({
      id,
      category
    }))
      .map(_ => (undefined));
  }

  public getCategoryById(id: number): Observable<KalturaCategory>{
    return this._kalturaServerClient.request(new CategoryGetAction({id}));
  }

  ngOnDestroy() {
  }

}
