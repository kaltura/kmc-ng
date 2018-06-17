import { KalturaMetadataProfile } from 'kaltura-ngx-client';
import { MetadataProfile } from 'app-shared/kmc-shared';
import { KalturaMetadataObjectType } from 'kaltura-ngx-client';

export interface SettingsMetadataProfile extends KalturaMetadataProfile {
  profileDisabled: boolean;
  parsedProfile?: MetadataProfile;
  defaultLabel?: string;
  applyTo?: KalturaMetadataObjectType;
  downloadUrl?: string;
  isNew?: boolean;
}
