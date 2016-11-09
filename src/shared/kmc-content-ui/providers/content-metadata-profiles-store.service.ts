import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { KalturaAPIClient } from '@kaltura-ng2/kaltura-api';
import { MetadataProfileService, KalturaMetadataProfileFilter, KalturaDetachedResponseProfile } from '@kaltura-ng2/kaltura-api/metadata-profile';

import * as R from 'ramda';

export interface MetadataProfiles{
    items : MetadataProfile[],
    loaded : boolean,
    status: string
}

export class MetadataProfile {
  id: string;
  name: string;
  xsd: any;
}

@Injectable()
export class ContentMetadataProfilesStore
{
    // TODO [KMC] - clear cached data on logout

    private _metadata_profiles: BehaviorSubject<MetadataProfiles> = new BehaviorSubject({items: [], loaded: false, status: ''});
    public metadata_profiles$: Observable<MetadataProfiles> = this._metadata_profiles.asObservable();

    constructor(private kalturaAPIClient : KalturaAPIClient) {

    }


    public reloadMetadataProfiles(ignoreCache: boolean = false) : Observable<boolean>
    {
        let filter, responseProfile;

        filter = new KalturaMetadataProfileFilter();
        Object.assign(filter, {orderBy : '+name', createModeNotEqual: 3, metadataObjectTypeEqual: '1'});

        responseProfile = new KalturaDetachedResponseProfile();
        Object.assign(responseProfile, {
          "objectType": "KalturaDetachedResponseProfile",
          "type": "1",
          "fields": "id,name,xsd,views"
        });

        const metadata_profiles = this._metadata_profiles.getValue();

      if (ignoreCache || !metadata_profiles.loaded || metadata_profiles.status) {
        this._metadata_profiles.next({items: [], loaded: false, status: ''});

        return Observable.create(observe => {
          MetadataProfileService.list(filter, responseProfile)
            .execute(this.kalturaAPIClient)
            .map((response) => {
              if (response && response.objects){
                return response.objects;
              }else{
                return [];
              }
            })
            .subscribe(
              (metadataProfiles) => {
                this._metadata_profiles.next({items: <MetadataProfile[]>metadataProfiles, loaded: true, status: ''});
                observe.next(true);
                observe.complete();
              },
              () => {
                // TODO [KMC]: handle error
                observe.next(false);
                observe.complete();
              }
            )
        });
      }else {
        return Observable.of(true);
      }
    }

}

