import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService, ViewMetadata } from '../kmc-main-view-base.service';
import { Router } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';
import { Title } from '@angular/platform-browser';

@Injectable()
export class ContentCategoriesMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        appLocalization: AppLocalization,
        titleService: Title
    ) {
        super(logger.subLogger('ContentCategoriesMainViewService'), browserService, router, appLocalization, titleService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.CONTENT_MANAGE_BASE,
            KMCPermissions.CONTENT_MANAGE_EDIT_CATEGORIES
            ]);
    }

    getRoutePath(): string {
        return 'content/categories';
    }

    getViewMetadata(): ViewMetadata {
        return {
            titleToken: 'contentCategoriesPageTitle',
            menuToken: 'contentCategoriesMenuTitle'
        };
    }
}
