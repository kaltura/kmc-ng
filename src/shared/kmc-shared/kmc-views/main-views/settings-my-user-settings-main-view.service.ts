import { Injectable } from '@angular/core';
import { KmcMainViewBaseService, ViewMetadata } from '../kmc-main-view-base.service';
import { Router } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';

@Injectable()
export class SettingsMyUserSettingsMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        appLocalization: AppLocalization,
        titleService: Title
    ) {
        super(logger.subLogger('SettingsMyUserSettingsMainViewService'), browserService, router, appLocalization, titleService);
    }

    isAvailable(): boolean {
        return true;
    }

    getRoutePath(): string {
        return 'settings/myUserSettings';
    }

    getViewMetadata(): ViewMetadata {
        return {
            titleToken: 'settingsMyUserSettingsPageTitle',
            menuToken: 'settingsMyUserSettingsMenuTitle'
        };
    }
}
