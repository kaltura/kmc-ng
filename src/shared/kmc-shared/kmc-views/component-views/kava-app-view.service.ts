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
export class KavaAppViewService extends KmcComponentViewBaseService<void> {

    constructor(private _appPermissions: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _kalturaClient: KalturaClient,
                private _router: Router,
                _browserService: BrowserService,
                _logger: KalturaLogger) {
        super(_logger.subLogger('KavaAppViewService'));
    }

    isAvailable(): boolean {
        this._logger.info(
            `handle isAvailable action for kava app`,
            {
                kavaConfig: {
                    enabled: serverConfig.externalApps.kava.enabled,
                    uri: serverConfig.externalApps.kava.uri
                }
            }
        );
        let isValid = false;
        if (serverConfig.externalApps.kava.enabled) {
            isValid =
                !!serverConfig.externalApps.kava.uri &&
                !serverConfig.externalApps.kava.uri.match(/\s/g); // not contains white spaces
            if (!isValid) {
                this._logger.warn('Disabling KAVA standalone application - configuration is invalid');
            }
        }

        this._logger.info(`availability result`, { isAvailable: isValid });

        return isValid;
    }
}
