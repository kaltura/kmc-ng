import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {KalturaNullableBoolean} from 'kaltura-ngx-client';
import {TranscodingProfileManagement} from 'app-shared/kmc-shared/transcoding-profile-management';


export interface TranscodingProfile {
  name: string;
  id: number;
}

@Injectable()
export class TranscodingProfilesService {

  constructor(private _transcodingProfileManagement: TranscodingProfileManagement) {
  }

  /** update the data for current partner */
  public getTranscodingProfiles(): Observable<TranscodingProfile[]> {
    return this._transcodingProfileManagement.get()
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
  }
}
