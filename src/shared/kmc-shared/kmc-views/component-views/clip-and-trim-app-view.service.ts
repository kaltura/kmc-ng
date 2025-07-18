import { Injectable } from '@angular/core';
import { KMCPermissionsService, KMCPermissions } from '../../kmc-permissions';
import { Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { KalturaClient } from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { KmcComponentViewBaseService } from 'app-shared/kmc-shared/kmc-views/kmc-component-view-base.service';
import { serverConfig } from 'config/server';
import { KalturaMediaEntry } from 'kaltura-ngx-client';
import {KalturaEntryStatus} from 'kaltura-ngx-client';
import {KalturaEntryReplacementStatus} from 'kaltura-ngx-client';
import {KalturaExternalMediaEntry} from 'kaltura-ngx-client';
import {KalturaMediaType} from 'kaltura-ngx-client';
import { KalturaLiveEntry } from 'kaltura-ngx-client';

export interface ClipAndTrimAppViewArgs {
    entry: KalturaMediaEntry | KalturaLiveEntry;
    hasSource: boolean;
}

@Injectable()
export class ClipAndTrimAppViewService extends KmcComponentViewBaseService<ClipAndTrimAppViewArgs> {

    constructor(private _appPermissions: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _kalturaClient: KalturaClient,
                private _router: Router,
                _browserService: BrowserService,
                _logger: KalturaLogger) {
        super(_logger.subLogger('ClipAndTrimAppViewService'));
    }

    isAvailable(args: ClipAndTrimAppViewArgs): boolean {
        const availableByConfiguration = !!serverConfig.externalApps.editor;
        const availableByPermissions = this._isAvailableByPermission();
        const availableByData = this._isAvailableByData(args);
        const result = availableByConfiguration && availableByData && availableByPermissions;
        this._logger.info(
            `handle isAvailable action`,
            {
                availableByConfiguration,
                availableByPermissions,
                availableByData,
                result
            }
        );
        return result;
    }

    private _isAvailableByPermission(): boolean {
        return this._appPermissions.hasAnyPermissions([
            KMCPermissions.CONTENT_INGEST_CLIP_MEDIA,
            KMCPermissions.CONTENT_INGEST_INTO_READY
        ]);
    }

    private _isAvailableByData(args: ClipAndTrimAppViewArgs): boolean {
        const { entry, hasSource} = args;
        const entryReady = entry.status === KalturaEntryStatus.ready;
        const isEntryReplacing = entry.replacementStatus && entry.replacementStatus !== KalturaEntryReplacementStatus.none;
        const isExternalMedia = entry instanceof KalturaExternalMediaEntry;
        const isEntryRelevant = [KalturaMediaType.video, KalturaMediaType.audio].indexOf(entry.mediaType) !== -1 && !isExternalMedia;
        const isLiveEntry = [
            KalturaMediaType.liveStreamFlash,
            KalturaMediaType.liveStreamWindowsMedia,
            KalturaMediaType.liveStreamRealMedia,
            KalturaMediaType.liveStreamQuicktime
        ].indexOf(entry.mediaType) !== -1;
        const isAvailableForLive = isLiveEntry && !!(<KalturaLiveEntry>entry).recordedEntryId;
        const isAvailableForMedia = !isLiveEntry && isEntryRelevant && hasSource && entryReady && !isEntryReplacing;
        const result = isAvailableForMedia || isAvailableForLive;

        this._logger.trace(`conditions used to check availability status by data`, () => (
            {
                result,
                entryReady,
                hasSource,
                isLiveEntry,
                isEntryReplacing,
                isExternalMedia,
                entryMediaType: entry.mediaType,
                isEntryRelevant,
                isAvailableForLive,
                isAvailableForMedia
            }
        ));

        return result;
    }


}
