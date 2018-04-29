import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router } from '@angular/router';
import {serverConfig} from 'config/server';
import { BrowserService } from 'app-shared/kmc-shell';

@Injectable()
export class UsageDashboardMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService
    ) {
        super(logger.subLogger('UsageDashboardMainViewService'),  browserService, router);
    }

    isAvailable(): boolean {
        return serverConfig.externalApps.usageDashboard.enabled && this._appPermissions.hasAnyPermissions([
            KMCPermissions.FEATURE_ENABLE_USAGE_DASHBOARD,
            KMCPermissions.ANALYTICS_BASE
        ]);
    }

    getRoutePath(): string {
        return 'usageDashboard';
    }
}


