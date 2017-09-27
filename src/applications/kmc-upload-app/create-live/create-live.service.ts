import {Injectable} from '@angular/core';
import {KalturaRecordStatus} from 'kaltura-typescript-client/types/KalturaRecordStatus';
import {KalturaLiveStreamEntry} from 'kaltura-typescript-client/types/KalturaLiveStreamEntry';
import {KalturaMediaType} from 'kaltura-typescript-client/types/KalturaMediaType';
import {KalturaDVRStatus} from 'kaltura-typescript-client/types/KalturaDVRStatus';
import {KalturaClient} from '@kaltura-ng/kaltura-client';
import {LiveStreamAddAction} from 'kaltura-typescript-client/types/LiveStreamAddAction';
import {KalturaSourceType} from 'kaltura-typescript-client/types/KalturaSourceType';
import {Observable} from 'rxjs/Observable';

export interface KalturaLiveStream {
  name: string
  description: string,
  transcodingProfile: number,
  liveDVR: boolean,
  enableRecording: boolean,
  enableRecordingSelectedOption: KalturaRecordStatus,
  previewMode: boolean
}

export interface ManualLive {
  name: string
}

export interface UniversalLive {
  name: string
}

@Injectable()
export class CreateLiveService {

  constructor(private _kalturaServerClient: KalturaClient) {
  }

  public createKalturaLiveStream(data: KalturaLiveStream): Observable<any> {
    const stream = new KalturaLiveStreamEntry({
      mediaType: KalturaMediaType.liveStreamFlash,
      name: data.name,
      description: data.description,
      recordStatus: data.enableRecording ? data.enableRecordingSelectedOption : KalturaRecordStatus.disabled,
      conversionProfileId: data.transcodingProfile,
      dvrStatus: data.liveDVR ? KalturaDVRStatus.enabled : KalturaDVRStatus.disabled,
      dvrWindow: data.liveDVR ? 120 : null
    });

    return this._kalturaServerClient
      .request(new LiveStreamAddAction({liveStreamEntry: stream, sourceType: KalturaSourceType.liveStream}))
  }

}
