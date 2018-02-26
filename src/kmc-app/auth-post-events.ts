import { Injectable } from '@angular/core';
import { AuthenticationPostEvents } from 'app-shared/kmc-shell';
import { appRoutePermissionsMapping } from 'app-shared/kmc-shared/app-permissions/app-route-permissions-mapping';
import { kmcAppConfig, KMCAppMenuItem, KMCAppSubMenuItem } from './kmc-app-config';
import { serverConfig } from 'config/server';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { AppPermissionsService } from '@kaltura-ng/mc-shared';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class KMCAuthenticationPostEvents implements AuthenticationPostEvents {

    private _logger: KalturaLogger;

    constructor(private _permissions: AppPermissionsService, logger: KalturaLogger) {
        this._logger = logger.subLogger('KMCAuthenticationPostEvents');
    }

    private _isItemEnabled(menuItem: KMCAppMenuItem | KMCAppSubMenuItem): boolean {
        switch (menuItem.id) {
            case 'usageDashboard':
                this._logger.info(`The external app '${menuItem.id}' is disabled, removing relevant menu item.`);
                return serverConfig.externalApps.usageDashboard.enabled;
            case 'studio':
                this._logger.info(`The external app '${menuItem.id}' is disabled, removing relevant menu item.`);
                return serverConfig.externalApps.studio.enabled;
            case 'kava':
                this._logger.info(`The external app '${menuItem.id}' is disabled, removing relevant menu item.`);
                return serverConfig.externalApps.kava.enabled;
            default:
                return true;
        }
    }

    private _hasViewPermission(menuItem: KMCAppMenuItem | KMCAppSubMenuItem): boolean {
        const itemPermissions = appRoutePermissionsMapping[menuItem.routePath];

        let result = false;
        if (itemPermissions && itemPermissions.length) {
            result = this._permissions.hasPermission(itemPermissions);
        }

        if (!result) {
            this._logger.info(`The user doesn't have sufficient permission to access app '${menuItem.id}', removing relevant menu item.`);
            return false;
        } else {
            return true;
        }
    }

    onUserLogIn(): Observable<void> {
        kmcAppConfig.menuItems = kmcAppConfig.menuItems.filter(item => this._isItemEnabled(item));

        kmcAppConfig.menuItems.forEach(item => {
            item.children = item.children.filter(childItem => this._hasViewPermission(childItem));
        });

        kmcAppConfig.menuItems = kmcAppConfig.menuItems.filter(item => item.children ? item.children.length > 0 : false);

        return Observable.of(undefined);
    }
}