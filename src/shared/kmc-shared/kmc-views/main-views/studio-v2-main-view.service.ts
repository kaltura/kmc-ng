import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KmcMainViewBaseService, ViewMetadata } from '../kmc-main-view-base.service';
import { Router } from '@angular/router';
import { serverConfig } from 'config/server';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';
import { Title } from '@angular/platform-browser';
import { ContextualHelpService } from 'app-shared/kmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class StudioV2MainViewService extends KmcMainViewBaseService {


    constructor(logger: KalturaLogger,
                browserService: BrowserService,
                router: Router,
                private _appPermissions: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                titleService: Title,
                contextualHelpService: ContextualHelpService) {
        super(logger.subLogger('StudioV2MainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        const isViewPermitted = this._appPermissions.hasAnyPermissions([
            KMCPermissions.STUDIO_BASE,
            KMCPermissions.STUDIO_ADD_UICONF,
            KMCPermissions.STUDIO_UPDATE_UICONF,
            KMCPermissions.STUDIO_DELETE_UICONF,
        ]);
        const studioHtmlIsAvailable = !!serverConfig.externalApps.studioV2;
        const studioHtmlIsPermitted = this._appPermissions.hasPermission(KMCPermissions.FEATURE_SHOW_HTML_STUDIO);

        this._logger.info(`handle isAvailable action by user`,
            { isViewPermitted, studioHtmlIsAvailable, studioHtmlIsPermitted });

        return isViewPermitted && studioHtmlIsAvailable && studioHtmlIsPermitted;
    }

    getRoutePath(): string {
        return 'studio/v2';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'studio-v2',
            title: this._appLocalization.get('app.titles.studioV2PageTitle'),
            menu: this._appLocalization.get('app.titles.studioV2MenuTitle')
        };
    }
}


