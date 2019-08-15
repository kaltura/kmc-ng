import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService, ViewMetadata } from '../kmc-main-view-base.service';
import { Router } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { ContextualHelpService } from 'app-shared/kmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class AdminMultiAccountMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('AdminMultiAccountMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        // TODO: update to the relevant permission once developed by backend
        return this._appPermissions.hasPermission(KMCPermissions.ADMIN_BASE) && this._appPermissions.hasPermission(KMCPermissions.FEATURE_VAR_CONSOLE_LOGIN);
    }

    getRoutePath(): string {
        return 'administration/multi-account';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'admin-multi-account',
            title: this._appLocalization.get('app.titles.administrationMultiAccountPageTitle'),
            menu: this._appLocalization.get('app.titles.administrationMultiAccountMenuTitle')
        };
    }
}
