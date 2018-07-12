import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BrowserService } from 'shared/kmc-shell/providers/browser.service';
import { serverConfig } from 'config/server';
import { KmcMainViewBaseService, ViewMetadata } from 'app-shared/kmc-shared/kmc-views/kmc-main-view-base.service';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { ContextualHelpService } from 'app-shared/kmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class ReachAppMainViewService extends KmcMainViewBaseService {

    constructor(private _appLocalization: AppLocalization,
                router: Router,
                browserService: BrowserService,
                titleService: Title,
                logger: KalturaLogger,
                contextualHelpService: ContextualHelpService) {
        super(logger.subLogger('ReachAppMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        return !!serverConfig.externalApps.reach;
    }

    getRoutePath(): string {
        return 'content/services-dashboard';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'services-dashboard',
            title: this._appLocalization.get('app.titles.contentReachPageTitle'),
            menu: this._appLocalization.get('app.titles.contentReachMenuTitle')
        };
    }
}
