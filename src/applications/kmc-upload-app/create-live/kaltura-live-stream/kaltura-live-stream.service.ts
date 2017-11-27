import {Injectable} from '@angular/core';
import {KalturaClient} from '@kaltura-ng/kaltura-client';
import {Observable} from 'rxjs/Observable';
import {ConversionProfileListAction} from '@kaltura-ng/kaltura-client/api/types/ConversionProfileListAction';
import {KalturaConversionProfileFilter} from '@kaltura-ng/kaltura-client/api/types/KalturaConversionProfileFilter';
import {KalturaConversionProfileType} from '@kaltura-ng/kaltura-client/api/types/KalturaConversionProfileType';
import {KalturaFilterPager} from '@kaltura-ng/kaltura-client/api/types/KalturaFilterPager';
import {KalturaConversionProfile} from '@kaltura-ng/kaltura-client/api/types/KalturaConversionProfile';

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
