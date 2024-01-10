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
export class ContentRoomsMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('ContentRoomsMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.CONTENT_MANAGE_BASE,
            KMCPermissions.CONTENT_MANAGE_METADATA,
            KMCPermissions.CONTENT_MANAGE_ASSIGN_CATEGORIES,
            KMCPermissions.CONTENT_MANAGE_THUMBNAIL,
            KMCPermissions.CONTENT_MANAGE_SCHEDULE,
            KMCPermissions.CONTENT_MANAGE_ACCESS_CONTROL,
            KMCPermissions.CONTENT_MANAGE_CUSTOM_DATA,
            KMCPermissions.CONTENT_MANAGE_DELETE
        ]);
    }

    getRoutePath(): string {
        return 'content/rooms';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'content-rooms',
            title: this._appLocalization.get('app.titles.contentRoomsPageTitle'),
            menu: this._appLocalization.get('app.titles.contentRoomsMenuTitle')
        };
    }
}
