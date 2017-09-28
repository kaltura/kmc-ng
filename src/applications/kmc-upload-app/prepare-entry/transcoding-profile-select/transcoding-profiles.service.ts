import {Injectable} from '@angular/core';
import {KalturaClient} from '@kaltura-ng/kaltura-client';
import {Observable} from 'rxjs/Observable';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {ConversionProfileListAction} from "kaltura-typescript-client/types/ConversionProfileListAction";
import {KalturaConversionProfileFilter} from "kaltura-typescript-client/types/KalturaConversionProfileFilter";
import {KalturaConversionProfileType} from "kaltura-typescript-client/types/KalturaConversionProfileType";
import {KalturaFilterPager} from "kaltura-typescript-client/types/KalturaFilterPager";
import {KalturaNullableBoolean} from "kaltura-typescript-client/types/KalturaNullableBoolean";


export interface TranscodingProfile {
  name: string;
  id: number;
}

@Injectable()
export class TranscodingProfilesService {

  constructor(private _kalturaServerClient: KalturaClient) {
  }

  /** update the data for current partner */
  public getTranscodingProfiles(): Observable<TranscodingProfile[]> {
    return this._kalturaServerClient.request(new ConversionProfileListAction({
      filter: new KalturaConversionProfileFilter({typeEqual: KalturaConversionProfileType.media}),
      pager: new KalturaFilterPager({pageSize: 500})
    }))
      .map(result => (result.objects))
      .map(profiles => {
        const defaultProfileIndex = profiles.findIndex(x => (x.isDefault === KalturaNullableBoolean.trueValue));
        // Set default profile as first in array (if not already first)
        if (defaultProfileIndex > 0) {
          const defaultProfile = profiles[defaultProfileIndex];
          profiles.splice(defaultProfileIndex, 1);
          profiles.unshift(defaultProfile);
        }
        return profiles;
      })
      .monitor('Transcoding profiles');
  }
}
