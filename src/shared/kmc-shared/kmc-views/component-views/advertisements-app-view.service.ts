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
    hasSource: boolean;
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
                    enabled: serverConfig.externalApps.editor.enabled,
                    uri: serverConfig.externalApps.editor.uri
                }
            }
        );

        const availableByConfiguration = serverConfig.externalApps.editor.enabled;
        const availableByPermissions = this._isAvailableByPermission();
        const availableByData = this._isAvailableByData(args);
        const result = availableByConfiguration && availableByData && availableByPermissions;
        this._logger.info(`check if view is available`, {
            result,
            validByPermissions: availableByPermissions,
            validByData: availableByData,
        });
        return result;
    }

    private _isAvailableByPermission(): boolean {
        return this._appPermissions.hasPermission(KMCPermissions.CUEPOINT_MANAGE);
    }

    private _isAvailableByData(args: AdvertisementsAppViewArgs): boolean {
        const { entry, hasSource} = args;
        const entryReady = entry.status === KalturaEntryStatus.ready;
        const isEntryReplacing = entry.replacementStatus !== KalturaEntryReplacementStatus.none;
        const isLiveEntry = entry.mediaType === KalturaMediaType.liveStreamFlash ||
            entry.mediaType === KalturaMediaType.liveStreamWindowsMedia ||
            entry.mediaType === KalturaMediaType.liveStreamRealMedia ||
            entry.mediaType === KalturaMediaType.liveStreamQuicktime;
        const isExternalMedia = entry instanceof KalturaExternalMediaEntry;
        const isEntryRelevant = [KalturaMediaType.video, KalturaMediaType.audio].indexOf(entry.mediaType) !== -1 && !isExternalMedia;

        const result = hasSource && entryReady && !isEntryReplacing && isEntryRelevant && !isLiveEntry;

        this._logger.debug(`conditions used to check availability status by data`, () => (
            {
                result,
                hasSource,
                entryReady,
                isLiveEntry,
                isEntryReplacing,
                isExternalMedia,
                entryMediaType: entry.mediaType,
                isEntryRelevant
            }
        ));

        return result;
    }
}
