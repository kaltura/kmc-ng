import { Injectable } from '@angular/core';
import { AppAuthenticationEvents, AppUser } from 'app-shared/kmc-shell';
import { appRoutePermissionsMapping } from 'app-shared/kmc-shared/app-permissions/app-route-permissions-mapping';
import { kmcAppConfig, KMCAppMenuItem, KMCAppSubMenuItem } from './kmc-app-config';
import { serverConfig } from 'config/server';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { AppPermissionsService } from '@kaltura-ng/mc-shared';
import { Observable } from 'rxjs/Observable';
import { KmcServerPolls } from 'app-shared/kmc-shared';
import {KalturaClient} from 'kaltura-ngx-client';
import * as Immutable from 'seamless-immutable';

@Injectable()
export class KMCAuthenticationEvents implements AppAuthenticationEvents {

    private _logger: KalturaLogger;

    constructor(private kalturaServerClient: KalturaClient,
                private _permissions: AppPermissionsService,
                private _serverPolls: KmcServerPolls,
                logger: KalturaLogger) {
        this._logger = logger.subLogger('KMCAuthenticationPostEvents');
    }


    onUserLoggedOut(): void {
        this.kalturaServerClient.setDefaultRequestOptions({});
        this._permissions.flushPermissions();
    }

    onUserLoggedIn(appUser: Immutable.ImmutableObject<AppUser>): Observable<void> {
        this.kalturaServerClient.setDefaultRequestOptions({
            ks: appUser.ks
        });

        this._syncAppMenuConfigWithPermissions();
        this._permissions.loadPermissions(Array.from(appUser.permissions));
        this._serverPolls.forcePolling();
        return Observable.of(undefined);
    }

    private _syncAppMenuConfigWithPermissions(): void {

        const isItemEnabled = (menuItem: KMCAppMenuItem | KMCAppSubMenuItem): boolean => {
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

        const hasViewPermission = (menuItem: KMCAppMenuItem | KMCAppSubMenuItem): boolean => {
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

        // kmcAppConfig.menuItems = kmcAppConfig.menuItems.filter(item => isItemEnabled(item));
        //
        // kmcAppConfig.menuItems.forEach(item => {
        //     item.children = item.children.filter(childItem => hasViewPermission(childItem));
        // });

        kmcAppConfig.menuItems = kmcAppConfig.menuItems.filter(item => item.children ? item.children.length > 0 : false);

    }
}