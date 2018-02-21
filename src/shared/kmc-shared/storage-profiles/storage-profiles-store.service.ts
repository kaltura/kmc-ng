import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { PartnerProfileStore } from '../partner-profile';
import { KalturaClient } from 'kaltura-ngx-client';
import { KalturaFlavorParams } from 'kaltura-ngx-client/api/types/KalturaFlavorParams';
import { KalturaStorageProfileStatus } from 'kaltura-ngx-client/api/types/KalturaStorageProfileStatus';
import { KalturaStorageProfileFilter } from 'kaltura-ngx-client/api/types/KalturaStorageProfileFilter';
import { StorageProfileListAction } from 'kaltura-ngx-client/api/types/StorageProfileListAction';
import { KalturaStorageProfileListResponse } from 'kaltura-ngx-client/api/types/KalturaStorageProfileListResponse';
import { catchError, map, publishReplay, refCount } from 'rxjs/operators';
import { KalturaStorageProfile } from 'kaltura-ngx-client/api/types/KalturaStorageProfile';

@Injectable()
export class StorageProfilesStore extends PartnerProfileStore implements OnDestroy {

  private _getStorageProfiles$: Observable<{ items: KalturaStorageProfile[] }>;

  constructor(private _kalturaServerClient: KalturaClient) {
    super();
  }

  public get(): Observable<{ items: KalturaStorageProfile[] }> {
    if (!this._getStorageProfiles$) {
      // execute the request
      this._getStorageProfiles$ = this._buildGetRequest()
        .cancelOnDestroy(this)
        .pipe(
          map(response => ({ items: response ? response.objects : [] })),
          catchError(
            error => {
              // re-throw the provided error
              this._getStorageProfiles$ = null;
              return Observable.throw(new Error(error.message || 'failed to retrieve storage profiles list'));
            }
          ),
          publishReplay(1),
          refCount()
        );
    }

    return this._getStorageProfiles$;
  }

  ngOnDestroy() {
  }

  private _buildGetRequest(): Observable<KalturaStorageProfileListResponse> {
    return this._kalturaServerClient.request(new StorageProfileListAction({
      filter: new KalturaStorageProfileFilter({
        statusIn: [KalturaStorageProfileStatus.automatic, KalturaStorageProfileStatus.manual].join(',')
      })
    }));
  }
}
