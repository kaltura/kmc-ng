import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { KmcMainViewBaseService, ViewMetadata } from '../kmc-main-view-base.service';
import { Router } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';
import { Title } from '@angular/platform-browser';

@Injectable()
export class ContentUploadsMainViewService extends KmcMainViewBaseService {

    constructor(
        logger: KalturaLogger,
        browserService: BrowserService,
        router: Router,
        private _appPermissions: KMCPermissionsService,
        appLocalization: AppLocalization,
        titleService: Title
    ) {
        super(logger.subLogger('ContentUploadsMainViewService'), browserService, router, appLocalization, titleService);
    }

    isAvailable(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.CONTENT_INGEST_BASE,
            KMCPermissions.CONTENT_INGEST_UPLOAD,
            KMCPermissions.CONTENT_INGEST_BULK_UPLOAD
        ]);
    }

    getRoutePath(): string {
        return 'content/upload-control';
    }

    getViewMetadata(): ViewMetadata {
        return {
            titleToken: 'contentUploadsPageTitle',
            menuToken: 'contentUploadsMenuTitle'
        };
    }
}
