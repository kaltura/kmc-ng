import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router, NavigationEnd } from '@angular/router';

@Injectable()
export class ContentEntriesMainViewService extends KmcMainViewBaseService {

    constructor(
        private _appPermissions: KMCPermissionsService,
        private router: Router
    ) {
        super();
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.CONTENT_MANAGE_BASE,
            KMCPermissions.CONTENT_MANAGE_METADATA,
            KMCPermissions.CONTENT_MANAGE_ASSIGN_CATEGORIES,
            KMCPermissions.CONTENT_MANAGE_THUMBNAIL,
            KMCPermissions.CONTENT_MANAGE_SCHEDULE,
            KMCPermissions.CONTENT_MANAGE_ACCESS_CONTROL,
            KMCPermissions.CONTENT_MANAGE_CUSTOM_DATA,
            KMCPermissions.CONTENT_MANAGE_EMBED_CODE,
            KMCPermissions.CONTENT_MANAGE_DELETE,
            KMCPermissions.CONTENT_MANAGE_RECONVERT,
            KMCPermissions.CONTENT_MANAGE_EDIT_CATEGORIES
        ]);
    }

    protected _open(): Observable<boolean> {
        return Observable.fromPromise(this.router.navigateByUrl('content/entries'));
    }
}
