import {Injectable} from '@angular/core';
import {KalturaClient, KalturaEntryApplication} from 'kaltura-ngx-client';
import { Observable } from 'rxjs';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import {MediaAddAction} from 'kaltura-ngx-client';
import {KalturaMediaEntry} from 'kaltura-ngx-client';
import {KalturaMediaType} from 'kaltura-ngx-client';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {globalConfig} from "config/global";


export interface DraftEntry {
  id: string;
}

@Injectable()
export class PrepareEntryService {

  constructor(private _kalturaServerClient: KalturaClient,
              private _appLocalization: AppLocalization) {
  }

  public createDraftEntry(mediaType: KalturaMediaType, conversionProfileId?: number): Observable<DraftEntry> {

    const entry: KalturaMediaEntry = new KalturaMediaEntry({
      name: this._appLocalization.get('applications.upload.uploadMenu.createDraft.draftEntry'),
      mediaType,
      application: KalturaEntryApplication.kmc,
      applicationVersion: globalConfig.client.appVersion,
      sourceVersion: mediaType === KalturaMediaType.video ? 'create_video' : 'create_audio',
    });

    if (conversionProfileId) {
      entry.conversionProfileId = conversionProfileId;
    }

    return this._kalturaServerClient
      .request(new MediaAddAction({entry}))
      .map(media => ({id: media.id}))
      .catch(error => {
        // re-throw the provided error
        return Observable.throw(new Error('Unable to create draft entry'));
      });
  }
}
