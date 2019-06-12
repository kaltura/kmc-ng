import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { KmcMainViewBaseService, ViewMetadata } from '../kmc-main-view-base.service';
import { Router } from '@angular/router';
import { serverConfig } from 'config/server';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { ContextualHelpService } from 'app-shared/kmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class AnalyticsMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('AnalyticsMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return (!!serverConfig.externalApps.kmcAnalytics || !!serverConfig.externalApps.liveAnalytics)
            && this._appPermissions.hasPermission(KMCPermissions.ANALYTICS_BASE);
    }

    getRoutePath(): string {
        return 'analytics';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: '', // this view is a wrapper which doesn't need to have it's own view key
            title: this._appLocalization.get('app.titles.analyticsPageTitle'),
            menu: this._appLocalization.get('app.titles.analyticsMenuTitle')
        };
    }
}


