import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService, ViewMetadata } from '../kmc-main-view-base.service';
import { Router } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { Title } from '@angular/platform-browser';
import { ContextualHelpService } from 'app-shared/kmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class ContentSyndicationMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('ContentSyndicationMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.SYNDICATION_BASE,
            KMCPermissions.SYNDICATION_ADD,
            KMCPermissions.SYNDICATION_UPDATE,
            KMCPermissions.SYNDICATION_DELETE
        ]);
    }

    getRoutePath(): string {
        return 'content/syndication';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'content-syndication',
            title: this._appLocalization.get('app.titles.contentSyndicationPageTitle'),
            menu: this._appLocalization.get('app.titles.contentSyndicationMenuTitle')
        };
    }
}
