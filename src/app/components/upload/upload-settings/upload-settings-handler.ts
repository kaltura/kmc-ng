import { Injectable } from '@angular/core';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { ConversionProfileListAction } from 'kaltura-typescript-client/types/ConversionProfileListAction';
import { KalturaConversionProfileType } from 'kaltura-typescript-client/types/KalturaConversionProfileType';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaConversionProfileFilter } from 'kaltura-typescript-client/types/KalturaConversionProfileFilter';
import { Observable } from 'rxjs/Observable';
import { KalturaConversionProfileListResponse } from 'kaltura-typescript-client/types/KalturaConversionProfileListResponse';
import { KalturaConversionProfile } from 'kaltura-typescript-client/types/KalturaConversionProfile';

@Injectable()
export class UploadSettingsHandler {
  constructor(private _kalturaServerClient: KalturaClient) {

  }

  getTranscodingProfiles(): Observable<Array<KalturaConversionProfile>> {
    const payload = new ConversionProfileListAction({
      filter: new KalturaConversionProfileFilter({ typeEqual: KalturaConversionProfileType.media }),
      pager: new KalturaFilterPager({ pageSize: 500 })
    });

    return this._kalturaServerClient
      .request(new ConversionProfileListAction(payload))
      .map((res: KalturaConversionProfileListResponse) => res.objects)
      .map(profiles => profiles.filter(profile => profile.getTypeName() === 'KalturaConversionProfile'));
  }
}
