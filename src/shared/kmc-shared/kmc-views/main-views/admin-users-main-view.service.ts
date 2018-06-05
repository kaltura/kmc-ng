import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import { Router } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { ViewMetadata } from 'app-shared/kmc-shared/kmc-views/kmc-main-view-base.service';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';
import { Title } from '@angular/platform-browser';

@Injectable()
export class AdminUsersMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title
    ) {
        super(logger.subLogger('AdminUsersMainViewService'), browserService, router, titleService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasPermission(KMCPermissions.ADMIN_BASE) && this._appPermissions.hasAnyPermissions([
            KMCPermissions.ADMIN_USER_ADD,
            KMCPermissions.ADMIN_USER_UPDATE,
            KMCPermissions.ADMIN_USER_DELETE
        ]);
    }

    getRoutePath(): string {
        return 'administration/users/list';
    }

    getViewMetadata(): ViewMetadata {
        return {
            title: this._appLocalization.get('app.titles.administrationUsersPageTitle'),
            menu: this._appLocalization.get('app.titles.administrationUsersMenuTitle')
        };
    }
}
