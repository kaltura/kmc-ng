import { Injectable } from '@angular/core';
import { KMCPermissionsService } from '../../kmc-permissions';
import { Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { KalturaClient } from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { KmcComponentViewBaseService } from 'app-shared/kmc-shared/kmc-views/kmc-component-view-base.service';
import { serverConfig } from 'config/server';

@Injectable()
export class LiveDashboardAppViewService extends KmcComponentViewBaseService<void> {

    constructor(private _appPermissions: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _kalturaClient: KalturaClient,
                private _router: Router,
                _browserService: BrowserService,
                _logger: KalturaLogger) {
        super(_logger.subLogger('LiveDashboardAppViewService'));
    }

    isAvailable(): boolean {
        return !!serverConfig.externalApps.liveDashboard;
    }
}
