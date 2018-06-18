import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KalturaClient } from 'kaltura-ngx-client';
import { ConversionProfileListAction } from 'kaltura-ngx-client';
import { KalturaConversionProfileFilter } from 'kaltura-ngx-client';
import { KalturaConversionProfileType } from 'kaltura-ngx-client';
import { KalturaFilterPager } from 'kaltura-ngx-client';
import { KalturaConversionProfileListResponse } from 'kaltura-ngx-client';
import { KalturaConversionProfile } from 'kaltura-ngx-client';

@Injectable()
export class TranscodingProfileManagement {
  private _transcodingProfileCache$;

  constructor(private _serverClient: KalturaClient) {

  }

  private _loadTranscodingProfiles(): Observable<KalturaConversionProfile[]> {
    return this._serverClient
      .request(
          new ConversionProfileListAction({
              filter: new KalturaConversionProfileFilter({ typeEqual: KalturaConversionProfileType.media }),
              pager: new KalturaFilterPager({ pageSize: 500 })
          })
      )
      .map((res: KalturaConversionProfileListResponse) => res.objects);
  }

  public get(): Observable<KalturaConversionProfile[]> {
    if (!this._transcodingProfileCache$) {
      this._transcodingProfileCache$ = this._loadTranscodingProfiles()
        .catch(err => {
          console.log(`log: [warn] [transcodingProfile-management] Error during load transcoding profiles: ${err}`);
          this._transcodingProfileCache$ = null;
          return Observable.throw(err);
        })
        .publishReplay(1)
        .refCount();
    }

    return this._transcodingProfileCache$;
  }

  public clearCache(): void {
    this._transcodingProfileCache$ = null;
  }
}
