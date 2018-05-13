import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService } from '../kmc-main-view-base.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';

@Injectable()
export class ContentSyndicationMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService
    ) {
        super(logger.subLogger('ContentSyndicationMainViewService'), browserService, router);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.SYNDICATION_BASE,
            KMCPermissions.SYNDICATION_ADD,
            KMCPermissions.SYNDICATION_UPDATE,
            KMCPermissions.SYNDICATION_DELETE
        ]);
    }

    getRoutePath(): string {
        return 'content/syndication';
    }
}
