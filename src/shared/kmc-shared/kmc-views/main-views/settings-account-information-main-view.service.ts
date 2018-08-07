import { Injectable } from '@angular/core';
import { KmcMainViewBaseService, ViewMetadata } from '../kmc-main-view-base.service';
import { Router } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { ContextualHelpService } from 'app-shared/kmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class SettingsAccountInformationMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appLocalization: AppLocalization,
        titleService: Title,
        contextualHelpService: ContextualHelpService
    ) {
        super(logger.subLogger('SettingsAccountInformationMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return true;
    }

    getRoutePath(): string {
        return 'settings/accountInformation';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'settings-account-info',
            title: this._appLocalization.get('app.titles.settingsAccountInfoPageTitle'),
            menu: this._appLocalization.get('app.titles.settingsAccountInfoMenuTitle')
        };
    }
}
