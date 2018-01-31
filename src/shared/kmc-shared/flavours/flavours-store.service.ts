import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {PartnerProfileStore} from '../partner-profile';
import 'rxjs/add/observable/throw';
import {KalturaClient} from 'kaltura-ngx-client';
import {FlavorParamsListAction} from 'kaltura-ngx-client/api/types/FlavorParamsListAction';
import {KalturaFlavorParams} from 'kaltura-ngx-client/api/types/KalturaFlavorParams';
import {KalturaFilterPager} from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import {KalturaFlavorParamsListResponse} from 'kaltura-ngx-client/api/types/KalturaFlavorParamsListResponse';
import {KalturaDetachedResponseProfile} from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import {KalturaResponseProfileType} from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';

@Injectable()
export class FlavoursStore extends PartnerProfileStore {

  private _getFlavorsFilters$: Observable<{ items: KalturaFlavorParams[] }>;

  constructor(private _kalturaServerClient: KalturaClient) {
    super();
  }

  public get(): Observable<{ items: KalturaFlavorParams[] }> {
    if (!this._getFlavorsFilters$) {
      // execute the request
      this._getFlavorsFilters$ = this._buildGetRequest().map(
        response => {
          return ({items: response ? response.objects : []});
        })
        .publishReplay(1)
        .refCount();
    }

    return this._getFlavorsFilters$;
  }

  private _buildGetRequest(): Observable<KalturaFlavorParamsListResponse> {

    const responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile(
      {
        fields: 'id,name',
        type: KalturaResponseProfileType.includeFields
      }
    );

    const favourParamsPager = new KalturaFilterPager();
    favourParamsPager.pageSize = 500;

    return this._kalturaServerClient.request(new FlavorParamsListAction({pager: favourParamsPager, responseProfile}));
  }
}
