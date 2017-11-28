import {KalturaRecordStatus} from '@kaltura-ng/kaltura-client/api/types/KalturaRecordStatus';

export interface KalturaLive {
  name: string
  description: string,
  transcodingProfile: number,
  liveDVR: boolean,
  enableRecording: boolean,
  enableRecordingSelectedOption: KalturaRecordStatus,
  previewMode: boolean
}
