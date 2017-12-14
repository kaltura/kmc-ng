import {Injectable} from '@angular/core';
import {KalturaClient, KalturaMultiRequest} from 'kaltura-ngx-client';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {Observable} from 'rxjs/Observable';
import {CategoryListAction} from 'kaltura-ngx-client/api/types/CategoryListAction';
import {KalturaCategoryFilter} from 'kaltura-ngx-client/api/types/KalturaCategoryFilter';
import {KalturaCategoryListResponse} from 'kaltura-ngx-client/api/types/KalturaCategoryListResponse';
import {PartnerGetInfoAction} from 'kaltura-ngx-client/api/types/PartnerGetInfoAction';
import {KalturaPartner} from 'kaltura-ngx-client/api/types/KalturaPartner';

export interface Entitlement {
  categories: KalturaCategory[];
  partnerDefaultEntitlementEnforcement: boolean
}

@Injectable()
export class EntitlementService {


  constructor(private _kalturaServerClient: KalturaClient) {
  }

  /** Get the account owners list for current partner */
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
      .monitor('get entitlements')
      .map(
        (response: KalturaCategoryListResponse) => {
          return response.objects;
        });
  }

  private _getPartnerDefaultEntitlementEnforcement(): Observable<{ defaultEntitlementEnforcement: boolean }> {

    return this._kalturaServerClient.request(new PartnerGetInfoAction())
      .monitor('get account info')
      .map(
        (response: KalturaPartner) => {

          return response;
        });
  }
}
