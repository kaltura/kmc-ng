import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';

@Injectable()
export class ContentModerationMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService
    ) {
        super(logger.subLogger('ContentModerationMainViewService'), browserService, router);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.CONTENT_MODERATE_BASE,
            KMCPermissions.CONTENT_MODERATE_METADATA,
            KMCPermissions.CONTENT_MODERATE_CUSTOM_DATA
        ]);
    }

    getRoutePath(): string {
        return 'content/moderation';
    }
}
