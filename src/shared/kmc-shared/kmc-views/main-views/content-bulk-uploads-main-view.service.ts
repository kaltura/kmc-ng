import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router, NavigationEnd } from '@angular/router';

@Injectable()
export class ContentBulkUploadsMainViewService extends KmcMainViewBaseService {

    constructor(
        private _appPermissions: KMCPermissionsService,
        private router: Router
    ) {
        super();
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.BULK_LOG_BASE
        ]);
    }

    protected _open(): Observable<boolean> {
        return Observable.fromPromise(this.router.navigateByUrl(this.getRoutePath()));
    }

    getRoutePath(): string {
        return 'content/bulk';
    }
}
