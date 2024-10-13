import {Injectable} from '@angular/core';
import {KMCPermissions, KMCPermissionsService} from '../../kmc-permissions';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {KmcMainViewBaseService, ViewMetadata} from '../kmc-main-view-base.service';
import {Router} from '@angular/router';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {Title} from '@angular/platform-browser';
import {ContextualHelpService} from 'app-shared/kmc-shared/contextual-help/contextual-help.service';

@Injectable()
export class UpgradePlayerMainViewService extends KmcMainViewBaseService {


    constructor(logger: KalturaLogger,
                browserService: BrowserService,
                router: Router,
                private _appPermissions: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                titleService: Title,
                contextualHelpService: ContextualHelpService) {
        super(logger.subLogger('UpgradePlayerMainViewService'), browserService, router, titleService, contextualHelpService);
    }

    isAvailable(): boolean {
        const isViewPermitted = this._appPermissions.hasPermission(KMCPermissions.STUDIO_UPDATE_UICONF) &&
            this._appPermissions.hasPermission(KMCPermissions.FEATURE_V2_V7_REDIRECT);

        this._logger.info(`handle isAvailable action by user`,
            { isViewPermitted });

        return isViewPermitted;
    }

    getRoutePath(): string {
        return 'studio/upgrade';
    }

    getViewMetadata(): ViewMetadata {
        return {
            viewKey: 'studio-upgrade',
            title: this._appLocalization.get('app.titles.upgradePlayerPageTitle'),
            menu: this._appLocalization.get('app.titles.upgradePlayerMenuTitle')
        };
    }
}


