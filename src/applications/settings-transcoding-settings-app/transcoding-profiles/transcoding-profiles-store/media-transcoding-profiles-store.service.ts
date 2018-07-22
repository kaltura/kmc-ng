import { Injectable } from '@angular/core';
import { BrowserService } from 'shared/kmc-shell/providers/browser.service';
import { KalturaConversionProfileType } from 'kaltura-ngx-client';
import { BaseTranscodingProfilesStore } from './base-transcoding-profiles-store.service';
import { KalturaClient } from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { SettingsTranscodingMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Injectable()
export class MediaTranscodingProfilesStore extends BaseTranscodingProfilesStore {
  protected localStoragePageSizeKey = 'media.transcodingProfiles.list.pageSize';
  protected transcodingProfilesListType = KalturaConversionProfileType.media;

  constructor(_kalturaServerClient: KalturaClient,
              _browserService: BrowserService,
              settingsTranscodingMainView: SettingsTranscodingMainViewService,
              _logger: KalturaLogger) {
    super(_kalturaServerClient, _browserService, settingsTranscodingMainView, _logger.subLogger('MediaTranscodingProfilesStore'));
  }
}

