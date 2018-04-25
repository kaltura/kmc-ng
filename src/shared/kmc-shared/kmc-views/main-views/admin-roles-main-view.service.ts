import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router, NavigationEnd } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Injectable()
export class AdminRolesMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        router: Router,
        private _appPermissions: KMCPermissionsService
    ) {
        super(logger.subLogger('AdminRolesMainViewService'), router);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasPermission(KMCPermissions.ADMIN_BASE) && this._appPermissions.hasAnyPermissions([
            KMCPermissions.ADMIN_ROLE_ADD,
            KMCPermissions.ADMIN_ROLE_UPDATE,
            KMCPermissions.ADMIN_ROLE_DELETE
        ]);
    }

    getRoutePath(): string {
        return 'administration/roles';
    }
}
