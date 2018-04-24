import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router, NavigationEnd } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Injectable()
export class ContentPlaylistsMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        router: Router,
        private _appPermissions: KMCPermissionsService
    ) {
        super(logger.subLogger('ContentPlaylistsMainViewService'), router);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.PLAYLIST_BASE,
            KMCPermissions.PLAYLIST_ADD,
            KMCPermissions.PLAYLIST_UPDATE,
            KMCPermissions.PLAYLIST_DELETE,
            KMCPermissions.PLAYLIST_EMBED_CODE
        ]);
    }

    getRoutePath(): string {
        return 'content/playlists';
    }
}
