import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BrowserService } from 'shared/kmc-shell/providers/browser.service';
import { serverConfig } from 'config/server';
import { KmcMainViewBaseService, ViewMetadata } from 'app-shared/kmc-shared/kmc-views/kmc-main-view-base.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { ContextualHelpService } from 'app-shared/kmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class KavaAppMainViewService extends KmcMainViewBaseService {

    constructor(private _appLocalization: AppLocalization,
                router: Router,
                browserService: BrowserService,
                titleService: Title,
                logger: KalturaLogger,
                contextualHelpService: ContextualHelpService) {
        super(logger.subLogger('KavaAppMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return !!serverConfig.externalApps.kava;
    }

    getRoutePath(): string {
        return 'analytics/kava';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'analytics-kava',
            title: this._appLocalization.get('app.titles.analyticsKavaPageTitle'),
            menu: this._appLocalization.get('app.titles.analyticsKavaMenuTitle')
        };
    }
}
