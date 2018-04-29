import { Injectable } from '@angular/core';
import { KMCPermissionsService } from '../../kmc-permissions';
import { Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { KalturaClient } from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
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
        this._logger.info(
            `handle isAvailable action for liveDashboard app`,
            {
                liveDashboardConfig: {
                    enabled: serverConfig.externalApps.liveDashboard.enabled,
                    uri: serverConfig.externalApps.liveDashboard.uri
                }
            }
        );
        let isValid = false;
        if (serverConfig.externalApps.liveDashboard.enabled) {
            isValid =
                !!serverConfig.externalApps.liveDashboard.uri &&
                !serverConfig.externalApps.liveDashboard.uri.match(/\s/g); // not contains white spaces
            if (!isValid) {
                this._logger.warn('Disabling Live Dashboard standalone application - configuration is invalid');
            }
        }

        this._logger.info(`availability result`, { isAvailable: isValid });

        return isValid;
    }
}
