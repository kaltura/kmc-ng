import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router, NavigationEnd } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';

@Injectable()
export class SettingsMetadataMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService
    ) {
        super(logger.subLogger('SettingsMetadataMainViewService'), browserService, router);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.CUSTOM_DATA_PROFILE_BASE,
            KMCPermissions.CUSTOM_DATA_PROFILE_ADD,
            KMCPermissions.CUSTOM_DATA_PROFILE_UPDATE,
            KMCPermissions.CUSTOM_DATA_PROFILE_DELETE
        ]);
    }

    getRoutePath(): string {
        return 'settings/metadata';
    }
}
