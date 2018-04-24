import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router } from '@angular/router';
import {serverConfig} from 'config/server';

@Injectable()
export class LiveAnalyticsMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        router: Router,
        private _appPermissions: KMCPermissionsService
    ) {
        super(logger.subLogger('LiveAnalyticsMainViewService'), router);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasPermission(KMCPermissions.ANALYTICS_BASE) && this._appPermissions.hasPermission(KMCPermissions.FEATURE_LIVE_STREAM);
    }

    getRoutePath(): string {
        return 'analytics/liveAnalytics';
    }

}


