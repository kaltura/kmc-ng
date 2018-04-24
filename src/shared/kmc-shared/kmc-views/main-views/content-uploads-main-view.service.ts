import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router, NavigationEnd } from '@angular/router';

@Injectable()
export class ContentUploadsMainViewService extends KmcMainViewBaseService {

    constructor(
        private _appPermissions: KMCPermissionsService,
        private router: Router
    ) {
        super();
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.CONTENT_INGEST_BASE,
            KMCPermissions.CONTENT_INGEST_UPLOAD,
            KMCPermissions.CONTENT_INGEST_BULK_UPLOAD
        ]);
    }

    protected _open(): Observable<boolean> {
        return Observable.fromPromise(this.router.navigateByUrl(this.getRoutePath()));
    }

    getRoutePath(): string {
        return 'content/upload-control';
    }
}
