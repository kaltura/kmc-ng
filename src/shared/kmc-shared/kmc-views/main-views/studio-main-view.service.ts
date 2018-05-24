import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import 'rxjs/add/observable/fromPromise';
import { Router } from '@angular/router';
import { serverConfig } from 'config/server';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';

@Injectable()
export class StudioMainViewService extends KmcMainViewBaseService {


    constructor(logger: KalturaLogger,
                browserService: BrowserService,
                router: Router,
                private _appPermissions: KMCPermissionsService) {
        super(logger.subLogger('StudioMainViewService'), browserService, router);
    }

    isAvailable(): boolean {
        return serverConfig.externalApps.studio.enabled && this._appPermissions.hasAnyPermissions([
                KMCPermissions.STUDIO_BASE,
                KMCPermissions.STUDIO_ADD_UICONF,
                KMCPermissions.STUDIO_UPDATE_UICONF,
                KMCPermissions.STUDIO_DELETE_UICONF,
            ]) && this._appPermissions.hasAnyPermissions([
                KMCPermissions.FEATURE_SHOW_HTML_STUDIO,
                KMCPermissions.FEATURE_V3_STUDIO_PERMISSION
            ]);
    }

    getRoutePath(): string {
        return 'studio';
    }
}


