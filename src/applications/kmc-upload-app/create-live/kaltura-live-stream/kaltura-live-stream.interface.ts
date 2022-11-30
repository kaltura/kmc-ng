import {KalturaRecordStatus} from 'kaltura-ngx-client';

export interface KalturaLive {
  name: string
  description: string,
  transcodingProfile: number,
  liveDVR: boolean,
  enableRecording: boolean,
  enableRecordingSelectedOption: KalturaRecordStatus,
  previewMode: boolean,
  lowLatency: boolean
}
