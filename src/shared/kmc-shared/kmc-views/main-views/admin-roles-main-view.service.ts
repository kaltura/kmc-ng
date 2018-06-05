import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService, ViewMetadata } from '../kmc-main-view-base.service';
import { Router } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';

@Injectable()
export class AdminRolesMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title
    ) {
        super(logger.subLogger('AdminRolesMainViewService'), browserService, router, titleService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasPermission(KMCPermissions.ADMIN_BASE) && this._appPermissions.hasAnyPermissions([
            KMCPermissions.ADMIN_ROLE_ADD,
            KMCPermissions.ADMIN_ROLE_UPDATE,
            KMCPermissions.ADMIN_ROLE_DELETE
        ]);
    }

    getRoutePath(): string {
        return 'administration/roles';
    }

    getViewMetadata(): ViewMetadata {
        return {
            title: this._appLocalization.get('app.titles.administrationRolesPageTitle'),
            menu: this._appLocalization.get('app.titles.administrationRolesMenuTitle')
        };
    }
}
