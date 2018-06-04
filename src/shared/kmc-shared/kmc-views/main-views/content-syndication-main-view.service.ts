import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService, ViewMetadata } from '../kmc-main-view-base.service';
import { Router } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';
import { Title } from '@angular/platform-browser';

@Injectable()
export class ContentSyndicationMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        appLocalization: AppLocalization,
        titleService: Title
    ) {
        super(logger.subLogger('ContentSyndicationMainViewService'), browserService, router, appLocalization, titleService);
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
            titleToken: 'contentSyndicationPageTitle',
            menuToken: 'contentSyndicationMenuTitle'
        };
    }
}
