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
export class SettingsTranscodingMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('SettingsTranscodingMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.TRANSCODING_BASE,
            KMCPermissions.TRANSCODING_ADD,
            KMCPermissions.TRANSCODING_UPDATE,
            KMCPermissions.TRANSCODING_DELETE
        ]);
    }

    getRoutePath(): string {
        return 'settings/transcoding';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'settings-transcoding',
            title: this._appLocalization.get('app.titles.settingsTranscodingPageTitle'),
            menu: this._appLocalization.get('app.titles.settingsTranscodingRolesMenuTitle')
        };
    }
}
