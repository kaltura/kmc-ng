
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

    private _logger: KalturaLogger;

    constructor(
        logger: KalturaLogger,
        private _appPermissions: KMCPermissionsService,
        private router: Router
    ) {
        super();
        this._logger = logger.subLogger('LiveAnalyticsMainViewService');
    }

    isAvailable(): boolean {
        return this._appPermissions.hasPermission(KMCPermissions.ANALYTICS_BASE) && this._appPermissions.hasPermission(KMCPermissions.FEATURE_LIVE_STREAM);
    }

    protected _open(): Observable<boolean> {
        return Observable.fromPromise(this.router.navigateByUrl('analytics/liveAnalytics'));
    }

}


