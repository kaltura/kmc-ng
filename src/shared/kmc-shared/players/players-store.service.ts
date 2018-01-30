import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ISubscription} from 'rxjs/Subscription';
import 'rxjs/add/observable/throw';
import {KalturaClient} from 'kaltura-ngx-client';
import {KalturaFilterPager} from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import {UiConfListAction} from 'kaltura-ngx-client/api/types/UiConfListAction';
import {KalturaUiConfListResponse} from 'kaltura-ngx-client/api/types/KalturaUiConfListResponse';
import {KalturaUiConfFilter} from 'kaltura-ngx-client/api/types/KalturaUiConfFilter';
import {KalturaUiConfObjType} from 'kaltura-ngx-client/api/types/KalturaUiConfObjType';
import {KalturaUiConf} from 'kaltura-ngx-client/api/types/KalturaUiConf';

@Injectable()
export class PlayersStore {
  private _cachedPlayers: KalturaUiConf[] = [];

  constructor(private _kalturaServerClient: KalturaClient) {
  }

  public get(): Observable<{ items: KalturaUiConf[] }> {
    let currentPageIndex = 0;
    return Observable.create(observer => {
      let sub: ISubscription;
      if (this._cachedPlayers.length) {
        observer.next({items: this._cachedPlayers});
        observer.complete();
      } else {
        const loadPlayers = () => {
          sub = this._buildRequest(500, ++currentPageIndex).subscribe(
            response => {
              this._cachedPlayers = this._cachedPlayers.concat(response.objects);

              if (this._cachedPlayers.length >= response.totalCount) {
                sub = null;
                observer.next({items: this._cachedPlayers});
                observer.complete();
              } else {
                loadPlayers();
              }
            },
            error => {
              sub = null;
              this._cachedPlayers = [];
              observer.error(error);
            }
          );
        };

        loadPlayers();
      }
      return () => {
        if (sub) {
          sub.unsubscribe();
        }
      }
    });

  }

  private _buildRequest(pageSize: number, pageIndex: number = 1): Observable<KalturaUiConfListResponse> {
    const filter: KalturaUiConfFilter = new KalturaUiConfFilter({
      objTypeEqual: KalturaUiConfObjType.player,
      tagsMultiLikeAnd: 'player'
    });

    const pager = new KalturaFilterPager({pageSize, pageIndex});

    return <any>this._kalturaServerClient.request(new UiConfListAction({filter, pager}));
  }
}
