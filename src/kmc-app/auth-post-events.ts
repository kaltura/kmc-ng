import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AuthenticationPostEvents } from 'app-shared/kmc-shell';
import { appRoutePermissionsMapping } from 'app-shared/kmc-shared/app-permissions/app-route-permissions-mapping';
import { kmcAppConfig, KMCAppMenuItem, KMCAppSubMenuItem } from './kmc-app-config';
import { serverConfig } from 'config/server';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { NgxPermissionsService } from 'ngx-permissions';

@Injectable()
export class KMCAuthenticationPostEvents implements AuthenticationPostEvents {

    private _logger: KalturaLogger;

    constructor(private _permissions: NgxPermissionsService, logger: KalturaLogger) {
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

    private _isItemPermitted(menuItem: KMCAppMenuItem | KMCAppSubMenuItem): Observable<boolean> {
        const itemPermissions = appRoutePermissionsMapping[menuItem.routePath];

        if (itemPermissions && itemPermissions.length) {
            return Observable.fromPromise(this._permissions.hasPermission(menuItem.routePath));
        } else {
            this._logger.info(`The user doesn't have sufficient permission to access app '${menuItem.id}', removing relevant menu item.`);
            return Observable.of(false);
        }
    }

    onUserLogIn(): Observable<void> {

        kmcAppConfig.menuItems
            .map(menuItem => Observable.of({ ...menuItem, children: menuItem.children.map(child => Observable.of(true))})
                .map
        const queue =
            .filter(item => this._isItemEnabled(item));



        return Observable.create(observer =>
        {
            const item = queue.shift();

            Observable.from(item.children)
                .concatMap(item =>
                {
                    return Observable.from(item.children)
                        .concatMap(subItem =>
                        {
                            return
                        })
                })
        });

        kmcAppConfig.menuItems.forEach(item =>
        {

        });

        kmcAppConfig.menuItems = modifiedMenu;

        return Observable.of(undefined);
    }
}