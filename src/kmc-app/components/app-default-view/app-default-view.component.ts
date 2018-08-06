import { Component, OnDestroy } from '@angular/core';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { KmcMainViewsService } from 'app-shared/kmc-shared/kmc-views';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';

@Component({
    selector: 'app-default-view',
    templateUrl: './app-default-view.component.html',
    styleUrls: ['./app-default-view.component.scss'],
    providers: [
        KalturaLogger.createLogger('AppDefaultViewComponent')
    ],
})
export class AppDefaultViewComponent implements OnDestroy {
    constructor(
        private _logger: KalturaLogger,
        private _browserService: BrowserService,
        private _appAuthentication: AppAuthentication,
        private _appLocalization: AppLocalization,
        private _viewsManager: KmcMainViewsService) {
        this.navigateToDefault();
    }

    ngOnDestroy() {}

    navigateToDefault() {
        this._appAuthentication.loginAutomatically(null)
            .pipe(cancelOnDestroy(this))
            .subscribe(result => {
                if (result) {
                    const menu = this._viewsManager.getMenu();
                    const firstItem = menu && menu.length ? menu[0] : null;

                    if (firstItem && firstItem.isAvailable) {
                        this._logger.info(`navigate to first available view`, { viewTitle: firstItem.menuTitle });
                        firstItem.open();
                    } else {
                        this._logger.warn(`cannot find available view to navigate to`);
                        this._browserService.navigateToError();
                    }
                } else {
                    this._logger.info(`navigate to login page`);
                    this._browserService.navigateToLogin();
                }
            });
    }
}
