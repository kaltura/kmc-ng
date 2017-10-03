import {Injectable} from '@angular/core';
import {KalturaClient} from '@kaltura-ng/kaltura-client';
import {Observable} from 'rxjs/Observable';
import {ConversionProfileListAction} from 'kaltura-typescript-client/types/ConversionProfileListAction';
import {KalturaConversionProfileFilter} from 'kaltura-typescript-client/types/KalturaConversionProfileFilter';
import {KalturaConversionProfileType} from 'kaltura-typescript-client/types/KalturaConversionProfileType';
import {KalturaFilterPager} from 'kaltura-typescript-client/types/KalturaFilterPager';
import {KalturaConversionProfile} from 'kaltura-typescript-client/types/KalturaConversionProfile';

@Injectable()
export class KalturaLiveStreamService {

  private _cachedConversionProfiles: KalturaConversionProfile[] = null;

  constructor(private _kalturaServerClient: KalturaClient) {
  }

  // return the cached conversion profiles
  public getKalturaConversionProfiles(): Observable<KalturaConversionProfile[]> {
    return Observable.create(observer => {
      if (!this._cachedConversionProfiles) {
        this._getKalturaConversionProfiles()
          .subscribe(
            result => {
              this._cachedConversionProfiles = result;
              observer.next(this._cachedConversionProfiles)
              observer.complete();
            },
            error => {
              observer.error(error);
            }
          );
      } else {
        observer.next(this._cachedConversionProfiles)
        observer.complete();
      }
    });
  }

  private _getKalturaConversionProfiles(): Observable<KalturaConversionProfile[]> {
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
