import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService, ViewMetadata } from '../kmc-main-view-base.service';
import { Router, NavigationEnd } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';

@Injectable()
export class SettingsAccessControlMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title
    ) {
        super(logger.subLogger('SettingsAccessControlMainViewService'), browserService, router, titleService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.ACCESS_CONTROL_BASE,
            KMCPermissions.ACCESS_CONTROL_ADD,
            KMCPermissions.ACCESS_CONTROL_UPDATE,
            KMCPermissions.ACCESS_CONTROL_DELETE
        ]);
    }

    getRoutePath(): string {
        return 'settings/accessControl';
    }

    getViewMetadata(): ViewMetadata {
        return {
            title: this._appLocalization.get('app.titles.settingsAccessControlPageTitle'),
            menu: this._appLocalization.get('app.titles.settingsAccessControlMenuTitle')
        };
    }
}
