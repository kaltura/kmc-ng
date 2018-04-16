import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaEntryReplacementStatus } from 'kaltura-ngx-client/api/types/KalturaEntryReplacementStatus';
import { KalturaExternalMediaEntry } from 'kaltura-ngx-client/api/types/KalturaExternalMediaEntry';
import { KalturaMediaType } from 'kaltura-ngx-client/api/types/KalturaMediaType';
import { serverConfig } from 'config/server';
import { KalturaEntryStatus } from 'kaltura-ngx-client/api/types/KalturaEntryStatus';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Injectable()
export class KEditHosterService {
  private _logger: KalturaLogger;

  constructor(
    private _permissionsService: KMCPermissionsService,
    logger: KalturaLogger
  ) {
    this._logger = logger.subLogger('KEditHosterService');
  }

  public isClipAndTrimAvailable(entry: KalturaMediaEntry): boolean {
    const entryReady = entry.status.toString() === KalturaEntryStatus.ready.toString();
    const isEntryReplacing = entry.replacementStatus !== KalturaEntryReplacementStatus.none;
    const isExternalMedia = entry instanceof KalturaExternalMediaEntry;
    const clipAndTrimAppEnabled = serverConfig.externalApps.clipAndTrim.enabled;
    const isEntryRelevant = [KalturaMediaType.video, KalturaMediaType.audio].indexOf(entry.mediaType) !== -1  && !isExternalMedia;
    const hasIngestClipPermission = this._permissionsService.hasAnyPermissions([
      KMCPermissions.CONTENT_INGEST_CLIP_MEDIA,
      KMCPermissions.CONTENT_INGEST_INTO_READY
    ]);

    const result = clipAndTrimAppEnabled && entryReady && !isEntryReplacing && hasIngestClipPermission && isEntryRelevant;

    this._logger.info(`checking clip&trim availability status`, { result });
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

    return result;
  }
}
