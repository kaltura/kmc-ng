import {Injectable} from '@angular/core';
import {KalturaRecordStatus} from 'kaltura-typescript-client/types/KalturaRecordStatus';
import {KalturaLiveStreamEntry} from 'kaltura-typescript-client/types/KalturaLiveStreamEntry';
import {KalturaMediaType} from 'kaltura-typescript-client/types/KalturaMediaType';
import {KalturaDVRStatus} from 'kaltura-typescript-client/types/KalturaDVRStatus';
import {KalturaClient} from '@kaltura-ng/kaltura-client';
import {LiveStreamAddAction} from 'kaltura-typescript-client/types/LiveStreamAddAction';
import {KalturaSourceType} from 'kaltura-typescript-client/types/KalturaSourceType';
import {Observable} from 'rxjs/Observable';
import {KalturaLiveStreamConfiguration} from "kaltura-typescript-client/types/KalturaLiveStreamConfiguration";
import {KalturaPlaybackProtocol} from "kaltura-typescript-client/types/KalturaPlaybackProtocol";

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
  description: string,
  flashHDSURL: string,
  hlsStreamUrl: string,
  useAkamaiHdProtocol: boolean
}

export interface UniversalLive {
  name: string
  description: string,
  primaryEncoderIp: string,
  secondaryEncoderIp: string,
  broadcastPassword: string,
  liveDvr: boolean
}

@Injectable()
export class CreateLiveService {

  constructor(private _kalturaServerClient: KalturaClient) {
  }

  public createKalturaLiveStream(data: KalturaLiveStream): Observable<any> {
    if (!data) {
      // todo: throw error
    }

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

  public createManualLiveStream(data: ManualLive): Observable<any> {
    if (!data) {
      // todo: throw error
    }
    const stream = new KalturaLiveStreamEntry({
      mediaType: KalturaMediaType.liveStreamFlash,
      name: data.name,
      description: data.description,
      liveStreamConfigurations: new Array(),
      hlsStreamUrl: data.hlsStreamUrl || ''
    });

    if (data.hlsStreamUrl) {
      const cfg = new KalturaLiveStreamConfiguration();
      cfg.protocol = KalturaPlaybackProtocol.appleHttp;
      cfg.url = stream.hlsStreamUrl;
      stream.liveStreamConfigurations.push(cfg);
    }

    if (data.flashHDSURL) {
      const cfg = new KalturaLiveStreamConfiguration();
      cfg.protocol = data.useAkamaiHdProtocol ? KalturaPlaybackProtocol.akamaiHds : KalturaPlaybackProtocol.hds;
      cfg.url = data.flashHDSURL;
      stream.liveStreamConfigurations.push(cfg);
    }

    return this._kalturaServerClient
      .request(new LiveStreamAddAction({liveStreamEntry: stream, sourceType: KalturaSourceType.manualLiveStream}))
  }

  public createUniversalLiveStream(data: UniversalLive): Observable<any> {
    if (!data) {
      // todo: throw error
    }
    // const stream = new KalturaLiveStreamEntry({
    //   mediaType: KalturaMediaType.liveStreamFlash,
    //   name: data.name,
    //   description: data.description,
    //   liveStreamConfigurations: new Array(),
    //   hlsStreamUrl: data.hlsStreamUrl || ''
    // });
    //
    // if (data.hlsStreamUrl) {
    //   const cfg = new KalturaLiveStreamConfiguration();
    //   cfg.protocol = KalturaPlaybackProtocol.appleHttp;
    //   cfg.url = stream.hlsStreamUrl;
    //   stream.liveStreamConfigurations.push(cfg);
    // }
    //
    // if (data.flashHDSURL) {
    //   const cfg = new KalturaLiveStreamConfiguration();
    //   cfg.protocol = data.useAkamaiHdProtocol ? KalturaPlaybackProtocol.akamaiHds : KalturaPlaybackProtocol.hds;
    //   cfg.url = data.flashHDSURL;
    //   stream.liveStreamConfigurations.push(cfg);
    // }

    return this._kalturaServerClient
      .request(new LiveStreamAddAction({liveStreamEntry: null, sourceType: KalturaSourceType.manualLiveStream}))
  }
}
