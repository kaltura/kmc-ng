import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { KmcMainViewBaseService, ViewMetadata } from '../kmc-main-view-base.service';
import { Router } from '@angular/router';
import {serverConfig} from 'config/server';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { ContextualHelpService } from 'app-shared/kmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class LiveAnalyticsMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('LiveAnalyticsMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasPermission(KMCPermissions.ANALYTICS_BASE) && this._appPermissions.hasPermission(KMCPermissions.FEATURE_LIVE_STREAM);
    }

    getRoutePath(): string {
        return 'analytics/liveAnalytics';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'analytics-live',
            title: this._appLocalization.get('app.titles.analyticsLivePageTitle'),
            menu: this._appLocalization.get('app.titles.analyticsLiveMenuTitle')
        };
    }
}


