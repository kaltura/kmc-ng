import { Component, Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { PlaylistListAction, KalturaPlaylistListResponse, KalturaPlaylistFilter, KalturaFilterPager, KalturaDetachedResponseProfile, KalturaResponseProfileType } from 'kaltura-typescript-client/types/all';
import { Observable } from 'rxjs/Observable';
import { AppAuthentication } from '@kaltura-ng2/kaltura-common';

@Injectable()
export class PlaylistsStore {
	constructor(private _kalturaClient: KalturaClient, private _appAuthentication: AppAuthentication){}

	buildQueryRequest() : Observable<KalturaPlaylistListResponse> {
		try {
			const filter = new KalturaPlaylistFilter({
				// freeText: "Sample"
			});

			const pager = new KalturaFilterPager({
				pageSize: 50,
				pageIndex: 1
			});

			const partnerId = this._appAuthentication.appUser.partnerId;

			const responseProfile = new KalturaDetachedResponseProfile({
				type: KalturaResponseProfileType.includeFields,
				fields: 'id,name,createdAt,playlistType'
			});

			return this._kalturaClient.request(new PlaylistListAction({
				filter: filter,
				pager: pager,
				partnerId: partnerId
				// responseProfile: responseProfile
			}));
		} catch(err) {
			return Observable.throw(err);
		}
	}
}

