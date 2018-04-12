import { Injectable } from '@angular/core';
import { BrowserService } from 'shared/kmc-shell/providers/browser.service';
import { KalturaConversionProfileType } from 'kaltura-ngx-client/api/types/KalturaConversionProfileType';
import { BaseTranscodingProfilesStore } from './base-transcoding-profiles-store.service';
import { KalturaClient } from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Injectable()
export class MediaTranscodingProfilesStore extends BaseTranscodingProfilesStore {
  protected localStoragePageSizeKey = 'media.transcodingProfiles.list.pageSize';
  protected transcodingProfilesListType = KalturaConversionProfileType.media;

  constructor(_kalturaServerClient: KalturaClient,
              _browserService: BrowserService,
              _logger: KalturaLogger) {
    super(_kalturaServerClient, _browserService, _logger.subLogger('MediaTranscodingProfilesStore'));
  }
}

