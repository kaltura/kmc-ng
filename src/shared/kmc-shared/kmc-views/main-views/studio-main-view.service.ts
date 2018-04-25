import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import 'rxjs/add/observable/fromPromise';
import { Router } from '@angular/router';
import {serverConfig} from 'config/server';
import { BrowserService } from 'app-shared/kmc-shell';

@Injectable()
export class StudioMainViewService extends KmcMainViewBaseService {


    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService
    ) {
        super(logger.subLogger('StudioMainViewService'), browserService, router);
    }

    isAvailable(): boolean {
        return this._isStudioAppValid() && this._appPermissions.hasAnyPermissions([
            KMCPermissions.STUDIO_BASE,
            KMCPermissions.STUDIO_ADD_UICONF,
            KMCPermissions.STUDIO_UPDATE_UICONF,
            KMCPermissions.STUDIO_DELETE_UICONF,
            KMCPermissions.FEATURE_SHOW_HTML_STUDIO,
            KMCPermissions.FEATURE_V3_STUDIO_PERMISSION
        ]);
    }

    private _isStudioAppValid(): boolean {
        let isValid = false;
        if (serverConfig.externalApps.studio.enabled) {
            isValid =
                !!serverConfig.externalApps.studio.uri &&
                !serverConfig.externalApps.studio.uri.match(/\s/g) && // not contains white spaces
                !!serverConfig.externalApps.studio.html5_version &&
                !!serverConfig.externalApps.studio.html5lib;

            if (!isValid) {
                this._logger.debug(`Disabling Studio standalone application - configuration is invalid`, {uri: serverConfig.externalApps.studio.uri, html5_version: serverConfig.externalApps.studio.html5_version, html5lib: serverConfig.externalApps.studio.html5lib});
            }
        }else{
            this._logger.debug(`Disabling Studio standalone application - studio is disabled`);
        }
        return isValid;
    }

    getRoutePath(): string {
        return 'studio';
    }
}


