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
export class ContentModerationMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('ContentModerationMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.CONTENT_MODERATE_BASE,
            KMCPermissions.CONTENT_MODERATE_METADATA,
            KMCPermissions.CONTENT_MODERATE_CUSTOM_DATA
        ]);
    }

    getRoutePath(): string {
        return 'content/moderation';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'content-moderation',
            title: this._appLocalization.get('app.titles.contentModerationPageTitle'),
            menu: this._appLocalization.get('app.titles.contentModerationMenuTitle')
        };
    }
}
