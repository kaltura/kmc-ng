import {Injectable} from '@angular/core';
import {KMCPermissions, KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions';
import {KalturaEntryReplacementStatus} from 'kaltura-ngx-client/api/types/KalturaEntryReplacementStatus';
import {KalturaExternalMediaEntry} from 'kaltura-ngx-client/api/types/KalturaExternalMediaEntry';
import {KalturaMediaType} from 'kaltura-ngx-client/api/types/KalturaMediaType';
import {serverConfig} from 'config/server';
import {KalturaEntryStatus} from 'kaltura-ngx-client/api/types/KalturaEntryStatus';
import {KalturaMediaEntry} from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';

@Injectable()
export class KEditHosterService {
  private _logger: KalturaLogger;

  constructor(
    private _permissionsService: KMCPermissionsService,
    logger: KalturaLogger,
    private _appLocalization: AppLocalization,
  ) {
    this._logger = logger.subLogger('KEditHosterService');
  }

  public isClipAndTrimAvailable(entry: KalturaMediaEntry): {isAvailable: boolean, reason: string} {
      let entryReady = true;
      let isEntryReplacing = false;
      let reason: string = null;
      if (entry.status.toString() !== KalturaEntryStatus.ready.toString()) {
          entryReady = false;
          reason = this._appLocalization.get('shared.keditHoster.entryNotReady');
      }

      if (entry.replacementStatus !== KalturaEntryReplacementStatus.none) {
          isEntryReplacing = true;
          reason = this._appLocalization.get('shared.keditHoster.entryBeingReplaced');
      }
    const isExternalMedia = entry instanceof KalturaExternalMediaEntry;
    const clipAndTrimAppEnabled = serverConfig.externalApps.clipAndTrim.enabled;
    const isEntryRelevant = [KalturaMediaType.video, KalturaMediaType.audio].indexOf(entry.mediaType) !== -1  && !isExternalMedia;
    const hasIngestClipPermission = this._permissionsService.hasAnyPermissions([
      KMCPermissions.CONTENT_INGEST_CLIP_MEDIA,
      KMCPermissions.CONTENT_INGEST_INTO_READY
    ]);

    const isAvailable = clipAndTrimAppEnabled && entryReady && !isEntryReplacing && hasIngestClipPermission && isEntryRelevant;


    this._logger.info(`checking clip&trim availability status`, { isAvailable });
    this._logger.trace(`conditions used to check availability status`, () => (
      {
        entryReady,
        isEntryReplacing,
        isExternalMedia,
        entryMediaType: entry.mediaType,
        clipAndTrimAppEnabled,
        isEntryRelevant,
        hasIngestClipPermission
      }
      ));

    return {isAvailable, reason};
  }

    public isAdvertisementsAvailable(entry: KalturaMediaEntry): {isAvailable: boolean, reason: string} {
        let entryReady = true;
        let isEntryReplacing = false;
        let reason: string = null;
        if (entry.status.toString() !== KalturaEntryStatus.ready.toString()) {
            entryReady = false;
            reason = this._appLocalization.get('shared.keditHoster.entryNotReady');
        }

        if (entry.replacementStatus !== KalturaEntryReplacementStatus.none) {
            isEntryReplacing = true;
            reason = this._appLocalization.get('shared.keditHoster.entryBeingReplaced');
        }
        const isExternalMedia = entry instanceof KalturaExternalMediaEntry;
        const advertisementsAppEnabled = serverConfig.externalApps.advertisements.enabled;
        const isEntryRelevant = [KalturaMediaType.video, KalturaMediaType.audio].indexOf(entry.mediaType) !== -1  && !isExternalMedia;
        const hasRelevantAdsPermission = this._permissionsService.hasAnyPermissions([
            KMCPermissions.FEATURE_ALLOW_VAST_CUE_POINT_NO_URL,
            KMCPermissions.CUEPOINT_MANAGE,
            KMCPermissions.FEATURE_DISABLE_KMC_KDP_ALERTS
        ]);

        const isAvailable = advertisementsAppEnabled && entryReady && !isEntryReplacing && hasRelevantAdsPermission && isEntryRelevant;


        this._logger.info(`checking clip&trim availability status`, { isAvailable });
        this._logger.trace(`conditions used to check availability status`, () => (
            {
                entryReady,
                isEntryReplacing,
                isExternalMedia,
                entryMediaType: entry.mediaType,
                advertisementsAppEnabled: advertisementsAppEnabled,
                isEntryRelevant,
                hasRelevantAdsPermission: hasRelevantAdsPermission
            }
        ));

        return {isAvailable, reason};
    }
}
