import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router, NavigationEnd } from '@angular/router';

@Injectable()
export class ContentPlaylistsMainViewService extends KmcMainViewBaseService {

    constructor(
        private _appPermissions: KMCPermissionsService,
        private router: Router
    ) {
        super();
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

    protected _open(): Observable<boolean> {
        return Observable.fromPromise(this.router.navigateByUrl(this.getRoutePath()));
    }

    getRoutePath(): string {
        return 'content/playlists';
    }
}
