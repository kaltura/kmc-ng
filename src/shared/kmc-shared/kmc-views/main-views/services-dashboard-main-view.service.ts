import { Injectable } from '@angular/core';
import { serverConfig } from 'config/server';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { KmcMainViewBaseService, ViewMetadata } from '../kmc-main-view-base.service';
import { Router } from '@angular/router';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { ContextualHelpService } from 'app-shared/kmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class ServicesDashboardMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('ServicesDashboardMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        const reachIsAvailable = !!serverConfig.externalApps.reach;
        return reachIsAvailable && this._appPermissions.hasPermission(KMCPermissions.REACH_PLUGIN_PERMISSION);
    }

    getRoutePath(): string {
        return 'servicesDashboard';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'services-dashboard',
            title: this._appLocalization.get('app.titles.reachDashboardPageTitle'),
            menu: this._appLocalization.get('app.titles.reachDashboardMenuTitle')
        };
    }
}


