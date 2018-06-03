import { Injectable } from '@angular/core';
import { KMCPermissionsService } from '../../kmc-permissions';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { ActivatedRoute, Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import { KmcDetailsViewBaseService } from 'app-shared/kmc-shared/kmc-views/kmc-details-view-base.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { KalturaPlaylistType } from 'kaltura-ngx-client/api/types/KalturaPlaylistType';
import { KalturaPlaylist } from 'kaltura-ngx-client/api/types/KalturaPlaylist';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

export interface RestorePasswordViewArgs {
    hash: string;
}


@Injectable()
export class RestorePasswordViewService extends KmcDetailsViewBaseService<RestorePasswordViewArgs> {

    constructor(private _appPermissions: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _router: Router,
                _browserService: BrowserService,
                _logger: KalturaLogger) {
        super(_logger.subLogger('RestorePasswordViewService'), _browserService);
    }

    isAvailable(args: RestorePasswordViewArgs): boolean {
        const hasHash = args && !!args.hash;
        this._logger.info(`handle isAvailable action by user`, { hasHash });
        return hasHash;
    }

    protected _open(args: RestorePasswordViewArgs): Observable<boolean> {
        this._logger.info('handle open view request by the user', {hash: args.hash});
        return this._browserService.navigateToLoginWithStatus();
    }
}
