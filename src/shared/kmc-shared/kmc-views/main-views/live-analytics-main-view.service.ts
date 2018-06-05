import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KmcMainViewBaseService, ViewMetadata } from '../kmc-main-view-base.service';
import { Router } from '@angular/router';
import {serverConfig} from 'config/server';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';

@Injectable()
export class LiveAnalyticsMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title
    ) {
        super(logger.subLogger('LiveAnalyticsMainViewService'), browserService, router, titleService);
    }

    isAvailable(): boolean {
        return !!serverConfig.externalApps.liveAnalytics && this._appPermissions.hasPermission(KMCPermissions.ANALYTICS_BASE) && this._appPermissions.hasPermission(KMCPermissions.FEATURE_LIVE_STREAM);
    }

    getRoutePath(): string {
        return 'analytics/liveAnalytics';
    }

    getViewMetadata(): ViewMetadata {
        return {
            title: this._appLocalization.get('app.titles.analyticsLivePageTitle'),
            menu: this._appLocalization.get('app.titles.analyticsLiveMenuTitle')
        };
    }
}


