import { Injectable } from '@angular/core';
import { KMCPermissionsService, KMCPermissions } from '../../kmc-permissions';
import { Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { KalturaClient } from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KmcComponentViewBaseService } from 'app-shared/kmc-shared/kmc-views/kmc-component-view-base.service';
import { serverConfig } from 'config/server';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import {KalturaEntryStatus} from 'kaltura-ngx-client/api/types/KalturaEntryStatus';
import {KalturaEntryReplacementStatus} from 'kaltura-ngx-client/api/types/KalturaEntryReplacementStatus';
import {KalturaExternalMediaEntry} from 'kaltura-ngx-client/api/types/KalturaExternalMediaEntry';
import {KalturaMediaType} from 'kaltura-ngx-client/api/types/KalturaMediaType';

export interface AdvertisementsAppViewArgs {
    entry: KalturaMediaEntry;
}

@Injectable()
export class AdvertisementsAppViewService extends KmcComponentViewBaseService<AdvertisementsAppViewArgs> {

    constructor(private _appPermissions: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _kalturaClient: KalturaClient,
                private _router: Router,
                _browserService: BrowserService,
                _logger: KalturaLogger) {
        super(_logger.subLogger('AdvertisementsAppViewService'));
    }

    isAvailable(args: AdvertisementsAppViewArgs): boolean {
        this._logger.info(
            `handle isAvailable action for advertisements app`,
            {
                advertisementsConfig: {
                    enabled: serverConfig.externalApps.advertisements.enabled,
                    uri: serverConfig.externalApps.advertisements.uri
                }
            }
        );

        const availableByConfiguration = this._isAvailableByConfiguration();
        const availableByPermissions = this._isAvailableByPermission();
        const availableByData = this._isAvailableByData(args.entry);
        const result = availableByConfiguration && availableByData && availableByPermissions;
        this._logger.info(`check if view is available`, {
            result,
            validByPermissions: availableByPermissions,
            validByData: availableByData,
            validByConfiguration: availableByConfiguration
        });
        return result;
    }

    private _isAvailableByPermission(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.FEATURE_ALLOW_VAST_CUE_POINT_NO_URL,
            KMCPermissions.CUEPOINT_MANAGE,
            KMCPermissions.FEATURE_DISABLE_KMC_KDP_ALERTS
        ]);
    }

    private _isAvailableByConfiguration(): boolean {
        if (serverConfig.externalApps.advertisements.enabled) {
            return !!serverConfig.externalApps.advertisements.uri &&
                !serverConfig.externalApps.advertisements.uri.match(/\s/g); // not contains white spaces
        }

        return false;
    }

    private _isAvailableByData(entry: KalturaMediaEntry): boolean {
        const entryReady = entry.status === KalturaEntryStatus.ready;
        const isEntryReplacing = entry.replacementStatus !== KalturaEntryReplacementStatus.none;

        const isExternalMedia = entry instanceof KalturaExternalMediaEntry;
        const isEntryRelevant = [KalturaMediaType.video, KalturaMediaType.audio].indexOf(entry.mediaType) !== -1 && !isExternalMedia;

        const result = entryReady && !isEntryReplacing && isEntryRelevant;

        this._logger.debug(`conditions used to check availability status by data`, () => (
            {
                result,
                entryReady,
                isEntryReplacing,
                isExternalMedia,
                entryMediaType: entry.mediaType,
                isEntryRelevant
            }
        ));

        return result;
    }
}
