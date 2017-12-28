import {Injectable} from '@angular/core';
import {KalturaClient, KalturaMultiRequest} from 'kaltura-ngx-client';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {Observable} from 'rxjs/Observable';
import {CategoryListAction} from 'kaltura-ngx-client/api/types/CategoryListAction';
import {KalturaCategoryFilter} from 'kaltura-ngx-client/api/types/KalturaCategoryFilter';
import {KalturaCategoryListResponse} from 'kaltura-ngx-client/api/types/KalturaCategoryListResponse';
import {PartnerGetInfoAction} from 'kaltura-ngx-client/api/types/PartnerGetInfoAction';
import {KalturaPartner} from 'kaltura-ngx-client/api/types/KalturaPartner';
import {KalturaPrivacyType} from 'kaltura-ngx-client/api/types/KalturaPrivacyType';
import {KalturaContributionPolicyType} from 'kaltura-ngx-client/api/types/KalturaContributionPolicyType';
import {KalturaAppearInListType} from 'kaltura-ngx-client/api/types/KalturaAppearInListType';
import {CategoryUpdateAction} from 'kaltura-ngx-client/api/types/CategoryUpdateAction';

export interface Entitlement {
  categories: KalturaCategory[];
  partnerDefaultEntitlementEnforcement: boolean
}

@Injectable()
export class EntitlementService {

  constructor(private _kalturaServerClient: KalturaClient) {
  }

  public getEntitlement(): Observable<Entitlement> {

    const request = new KalturaMultiRequest(
      new PartnerGetInfoAction(),
      new CategoryListAction({
        filter: new KalturaCategoryFilter({
          privacyContextEqual: '*'
        })
      })
    );

    return <any>(this._kalturaServerClient.multiRequest(request).map(
      response => {
        if (response.hasErrors()) {
          throw new Error('error occurred in action \'getEntitlement\'');
        }

        const partnerDefaultEntitlementEnforcement =
          (<KalturaPartner>response[0].result).defaultEntitlementEnforcement;
        const categories = (<KalturaCategoryListResponse>response[1].result).objects;
        return {categories, partnerDefaultEntitlementEnforcement};
      }
    ));
  }

  private _getCategoriesList(): Observable<KalturaCategory[]> {

    const filter = new KalturaCategoryFilter({
      privacyContextEqual: '*'
    });

    return this._kalturaServerClient.request(new CategoryListAction({filter}))
      .map(
        (response: KalturaCategoryListResponse) => {
          return response.objects;
        });
  }

  private _getPartnerDefaultEntitlementEnforcement(): Observable<{ defaultEntitlementEnforcement: boolean }> {

    return this._kalturaServerClient.request(new PartnerGetInfoAction())
      .map(
        (response: KalturaPartner) => {

          return response;
        });
  }

  public deleteEntitlement(entitlement: KalturaCategory): Observable<void> {
    const category = new KalturaCategory();
    category.privacyContext = null;

    const context = entitlement.privacyContext.split(',');
    const contexts = entitlement.privacyContexts.split(',');

    // Subtract privacyContext from privacyContexts and if no contexts left so set the following properties
    if (contexts.filter(c => (context.indexOf(c) < 0)).length) {
      category.privacy = KalturaPrivacyType.all;
      category.appearInList = KalturaAppearInListType.partnerOnly;
      category.contributionPolicy = KalturaContributionPolicyType.all;
    }

    return this._kalturaServerClient.request(new CategoryUpdateAction({
      id: entitlement.id,
      category
    }))
      .map(_ => (undefined));
  }

  public addEntitlement(newEntitlementData: { categoryId: number, privacyContextLabel: string }): Observable<void> {
    const category = new KalturaCategory({
      privacyContext: newEntitlementData.privacyContextLabel
    });

    return this._kalturaServerClient.request(new CategoryUpdateAction({
      id: newEntitlementData.categoryId,
      category
    }))
      .map(_ => (undefined));
  }
}
