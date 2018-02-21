import { Injectable } from '@angular/core';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { KalturaConversionProfileType } from 'kaltura-ngx-client/api/types/KalturaConversionProfileType';
import { BaseTranscodingProfilesStore } from './base-transcoding-profiles-store.service';
import { KalturaClient } from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { FlavoursStore } from 'app-shared/kmc-shared/flavours';
import { StorageProfilesStore } from 'app-shared/kmc-shared/storage-profiles/storage-profiles-store.service';

@Injectable()
export class MediaTranscodingProfilesStore extends BaseTranscodingProfilesStore {
  protected localStoragePageSizeKey = 'media.transcodingProfiles.list.pageSize';
  protected transcodingProfilesListType = KalturaConversionProfileType.media;

  constructor(_kalturaServerClient: KalturaClient,
              _browserService: BrowserService,
              _flavorsStore: FlavoursStore,
              _storageProfilesStore: StorageProfilesStore,
              _logger: KalturaLogger) {
    super(_kalturaServerClient, _browserService, _flavorsStore, _storageProfilesStore, _logger);
    this._prepare();
  }
}

