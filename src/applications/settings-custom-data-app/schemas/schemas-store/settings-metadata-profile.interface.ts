import { KalturaMetadataProfile } from 'kaltura-ngx-client/api/types/KalturaMetadataProfile';
import { MetadataProfile } from 'app-shared/kmc-shared';

export interface SettingsMetadataProfile extends KalturaMetadataProfile {
  profileDisabled: boolean;
  parsedProfile?: MetadataProfile;
  defaultLabel?: string;
  applyTo?: string;
  downloadUrl?: string;
  isNew?: boolean;
  fieldsMoved?: boolean;
}
