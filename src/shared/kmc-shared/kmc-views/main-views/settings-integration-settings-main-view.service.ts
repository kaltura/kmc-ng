import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService, ViewMetadata } from '../kmc-main-view-base.service';
import { Router } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';

@Injectable()
export class SettingsIntegrationSettingsMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        appLocalization: AppLocalization,
        titleService: Title
    ) {
        super(logger.subLogger('SettingsIntegrationSettingsMainViewService'), browserService, router, appLocalization, titleService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.INTEGRATION_BASE,
            KMCPermissions.INTEGRATION_UPDATE_SETTINGS
        ]);
    }

    getRoutePath(): string {
        return 'settings/integrationSettings';
    }

    getViewMetadata(): ViewMetadata {
        return {
            titleToken: 'settingsIntegrationPageTitle',
            menuToken: 'settingsIntegrationMenuTitle'
        };
    }
}
