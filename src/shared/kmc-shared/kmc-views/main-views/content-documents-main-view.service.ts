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
export class ContentDocumentsMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('ContentDocumentsMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return true;
        // return this._appPermissions.hasAnyPermissions([
        //     KMCPermissions.PLAYLIST_BASE,
        //     KMCPermissions.PLAYLIST_ADD,
        //     KMCPermissions.PLAYLIST_UPDATE,
        //     KMCPermissions.PLAYLIST_DELETE,
        //     KMCPermissions.PLAYLIST_EMBED_CODE
        // ]);
    }

    getRoutePath(): string {
        return 'content/documents';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'content-documents',
            title: this._appLocalization.get('app.titles.contentDocumentsPageTitle'),
            menu: this._appLocalization.get('app.titles.contentDocumentsMenuTitle')
        };
    }
}
