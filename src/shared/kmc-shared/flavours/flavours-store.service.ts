import {Injectable, OnDestroy} from '@angular/core';
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
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

@Injectable()
export class FlavoursStore extends PartnerProfileStore implements OnDestroy {

  private _getFlavorsFilters$: Observable<{ items: KalturaFlavorParams[] }>;

  constructor(private _kalturaServerClient: KalturaClient) {
    super();
  }

  public get(): Observable<{ items: KalturaFlavorParams[] }> {
    if (!this._getFlavorsFilters$) {
      // execute the request
      this._getFlavorsFilters$ = this._buildGetRequest()
        .cancelOnDestroy(this)
        .map(
          response => {
            return ({items: response ? response.objects : []});
          })
        .catch(error => {
            // re-throw the provided error
            this._getFlavorsFilters$ = null;
            return Observable.throw(new Error('failed to retrieve flavors list'));
        })
        .publishReplay(1)
        .refCount();
    }

    return this._getFlavorsFilters$;
  }

  ngOnDestroy()
  {
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
