import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { PartnerProfileStore } from '../partner-profile';

import { KalturaClient } from 'kaltura-ngx-client';
import { AccessControlListAction } from 'kaltura-ngx-client/api/types/AccessControlListAction';

import { KalturaAccessControlFilter } from 'kaltura-ngx-client/api/types/KalturaAccessControlFilter';
import { KalturaAccessControl } from 'kaltura-ngx-client/api/types/KalturaAccessControl';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { KalturaAccessControlListResponse } from 'kaltura-ngx-client/api/types/KalturaAccessControlListResponse';
import { AppEventsService } from '../app-events';
import { AccessControlProfileUpdatedEvent } from '../events/access-control-profile-updated.event';

@Injectable()
export class AccessControlProfileStore extends PartnerProfileStore implements OnDestroy {
  private _cachedProfiles: KalturaAccessControl[] = [];

  constructor(private _kalturaServerClient: KalturaClient, _appEvents: AppEventsService) {
    super();

    _appEvents.event(AccessControlProfileUpdatedEvent)
      .cancelOnDestroy(this)
      .subscribe(() => {
        this._clearCache();
      });
  }

  ngOnDestroy() {
  }

  private _clearCache(): void {
    this._cachedProfiles = [];
  }

  public get(): Observable<{ items: KalturaAccessControl[] }> {
    const cachedResults = this._cachedProfiles;

    if (cachedResults && cachedResults.length) {
      return Observable.of({ items: cachedResults });
    }

    return this._buildGetRequest()
      .do(({ objects }) => {
        this._cachedProfiles = objects;
      })
      .map(({ objects }) => ({ items: objects }));
  }

  private _buildGetRequest(): Observable<KalturaAccessControlListResponse> {
    const filter = new KalturaAccessControlFilter({ orderBy: '-createdAt' });
    const pager = new KalturaFilterPager({ pageSize: 1000 });
    return <any>this._kalturaServerClient.request(new AccessControlListAction({ filter, pager }));
  }
}
