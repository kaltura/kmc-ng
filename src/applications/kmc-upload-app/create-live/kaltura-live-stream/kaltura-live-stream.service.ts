import {Injectable} from '@angular/core';
import {KalturaClient} from 'kaltura-ngx-client';
import {Observable} from 'rxjs/Observable';
import {ConversionProfileListAction} from 'kaltura-ngx-client/api/types/ConversionProfileListAction';
import {KalturaConversionProfileFilter} from 'kaltura-ngx-client/api/types/KalturaConversionProfileFilter';
import {KalturaConversionProfileType} from 'kaltura-ngx-client/api/types/KalturaConversionProfileType';
import {KalturaFilterPager} from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import {KalturaConversionProfile} from 'kaltura-ngx-client/api/types/KalturaConversionProfile';

@Injectable()
export class KalturaLiveStreamService {

  constructor(private _kalturaServerClient: KalturaClient) {
  }

  public getKalturaConversionProfiles(): Observable<KalturaConversionProfile[]> {
    // filter
    const kalturaConversionProfileFilter = new KalturaConversionProfileFilter({
      typeEqual: KalturaConversionProfileType.liveStream
    });

    // pager
    const kalturaFilterPager = new KalturaFilterPager({pageSize: 500, pageIndex: 1});

    return this._kalturaServerClient
      .request(new ConversionProfileListAction({filter: kalturaConversionProfileFilter, pager: kalturaFilterPager}))
      .map(response => (<KalturaConversionProfile[]>response.objects))
  }
}
