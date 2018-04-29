import { Injectable } from '@angular/core';
import { AppAuthenticationEvents, AppUser } from 'app-shared/kmc-shell';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { Observable } from 'rxjs/Observable';
import { KmcServerPolls } from 'app-shared/kmc-shared';
import {KalturaClient} from 'kaltura-ngx-client';
import * as Immutable from 'seamless-immutable';

@Injectable()
export class KMCAuthenticationEvents implements AppAuthenticationEvents {

    private _logger: KalturaLogger;

    constructor(private kalturaServerClient: KalturaClient,
                private _permissions: KMCPermissionsService,
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

        this._serverPolls.forcePolling();
        return Observable.of(undefined);
    }


}
