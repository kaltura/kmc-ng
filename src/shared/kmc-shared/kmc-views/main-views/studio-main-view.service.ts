import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router } from '@angular/router';
import {serverConfig} from 'config/server';

@Injectable()
export class StudioMainViewService extends KmcMainViewBaseService {

    private _logger: KalturaLogger;

    constructor(
        logger: KalturaLogger,
        private _appPermissions: KMCPermissionsService,
        private router: Router
    ) {
        super();
        this._logger = logger.subLogger('StudioMainViewService');
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

    protected _open(): Observable<boolean> {
        return Observable.fromPromise(this.router.navigateByUrl('studio'));
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
}


