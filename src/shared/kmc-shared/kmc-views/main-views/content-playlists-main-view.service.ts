import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService, ViewMetadata } from '../kmc-main-view-base.service';
import { Router } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';

@Injectable()
export class ContentPlaylistsMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        appLocalization: AppLocalization,
        titleService: Title
    ) {
        super(logger.subLogger('ContentPlaylistsMainViewService'), browserService, router, appLocalization, titleService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.PLAYLIST_BASE,
            KMCPermissions.PLAYLIST_ADD,
            KMCPermissions.PLAYLIST_UPDATE,
            KMCPermissions.PLAYLIST_DELETE,
            KMCPermissions.PLAYLIST_EMBED_CODE
        ]);
    }

    getRoutePath(): string {
        return 'content/playlists';
    }

    getViewMetadata(): ViewMetadata {
        return {
            titleToken: 'contentPlaylistsPageTitle',
            menuToken: 'contentPlaylistsMenuTitle'
        };
    }
}
