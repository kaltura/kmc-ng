import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { kmcAppConfig } from '../../../kmc-app/kmc-app-config';
import { KmcMainViewsService } from 'app-shared/kmc-shared/kmc-views';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';

@Injectable()
export class AppNavigator {
    private _logger: KalturaLogger;

    constructor(private router: Router,
                logger: KalturaLogger,
                private _viewsManager: KmcMainViewsService) {
        this._logger = logger.subLogger('AppNavigator');
    }

    public navigateToLogin(): void {
        this.router.navigateByUrl('/login');
    }

    public navigateToDefault(extras?: NavigationExtras): void {

        const menu = this._viewsManager.getMenu();
        const firstItem = menu && menu.length ? menu[0] : null;

        if (firstItem) {
            firstItem.open();
        } else {
            this._logger.error('cannot navigate to default view, no available view found');
        }
    }

    public navigateToError(): void {
        this.router.navigateByUrl(kmcAppConfig.routing.errorRoute);
    }

    public navigate(path: string): void {
        this.router.navigateByUrl(path);
    }
}
