import { Injectable } from '@angular/core';
import { KmcMainViewBaseService, ViewMetadata } from '../kmc-main-view-base.service';
import { Router } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { serverConfig } from 'config/server';
import { ContextualHelpService } from 'app-shared/kmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class SettingsAuthenticationMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('SettingsAuthenticationMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return !!serverConfig.externalServices && !!serverConfig.externalServices.authBrokerServer && !!serverConfig.externalServices.authBrokerServer.uri;
    }

    getRoutePath(): string {
        return 'settings/authentication';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'settings-authentication',
            title: this._appLocalization.get('app.titles.settingsAuthenticationPageTitle'),
            menu: this._appLocalization.get('app.titles.settingsAuthenticationMenuTitle')
        };
    }
}
