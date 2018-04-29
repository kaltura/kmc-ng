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
export class LiveAnalyticsMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService
    ) {
        super(logger.subLogger('LiveAnalyticsMainViewService'), browserService, router);
    }

    isAvailable(): boolean {
        return this._isLiveAnalyticsAppValid() && this._appPermissions.hasPermission(KMCPermissions.ANALYTICS_BASE) && this._appPermissions.hasPermission(KMCPermissions.FEATURE_LIVE_STREAM);
    }

    private _isLiveAnalyticsAppValid(): boolean {
        let isValid = false;
        if (serverConfig.externalApps.liveAnalytics.enabled) {
            isValid =
                !!serverConfig.externalApps.liveAnalytics.uri &&
                !serverConfig.externalApps.liveAnalytics.uri.match(/\s/g) && // not contains white spaces
                !!serverConfig.externalApps.liveAnalytics.uiConfId;

            if (!isValid) {
                this._logger.debug(`Disabling Live Analytics standalone application - configuration is invalid`, {uri: serverConfig.externalApps.liveAnalytics.uri, uiconfID: serverConfig.externalApps.liveAnalytics.uiConfId});
            }
        }else{
            this._logger.debug(`Disabling Live Analytics standalone application - Live Analytics is disabled`);
        }
        return isValid;
    }


    getRoutePath(): string {
        return 'analytics/liveAnalytics';
    }

}


