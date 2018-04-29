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
export class ClipAndTrimAppViewService extends KmcComponentViewBaseService<void> {

    constructor(private _appPermissions: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _kalturaClient: KalturaClient,
                private _router: Router,
                _browserService: BrowserService,
                _logger: KalturaLogger) {
        super(_logger.subLogger('ClipAndTrimAppViewService'));
    }

    isAvailable(): boolean {
        this._logger.info(
            `handle isAvailable action for clipAndTrim app`,
            {
                clipAndTrimConfig: {
                    enabled: serverConfig.externalApps.clipAndTrim.enabled,
                    uri: serverConfig.externalApps.clipAndTrim.uri
                }
            }
        );
        let isValid = false;
        if (serverConfig.externalApps.clipAndTrim.enabled) {
            isValid =
                !!serverConfig.externalApps.clipAndTrim.uri &&
                !serverConfig.externalApps.clipAndTrim.uri.match(/\s/g); // not contains white spaces
            if (!isValid) {
                this._logger.warn('Disabling clipAndTrim (kedit) standalone application - configuration is invalid');
            }
        }

        this._logger.info(`availability result`, { isAvailable: isValid });

        return isValid;
    }
}
