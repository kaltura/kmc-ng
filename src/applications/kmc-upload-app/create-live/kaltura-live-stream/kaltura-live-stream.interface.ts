import {KalturaRecordStatus} from 'kaltura-typescript-client/types/KalturaRecordStatus';

export interface KalturaLive {
  name: string
  description: string,
  transcodingProfile: number,
  liveDVR: boolean,
  enableRecording: boolean,
  enableRecordingSelectedOption: KalturaRecordStatus,
  previewMode: boolean
}
