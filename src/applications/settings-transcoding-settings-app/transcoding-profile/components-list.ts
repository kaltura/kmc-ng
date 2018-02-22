import { TranscodingProfileSectionsListComponent } from './transcoding-profile-sections-list/transcoding-profile-sections-list.component';
import { TranscodingProfileComponent } from './transcoding-profile.component';
import { TranscodingProfileDetailsComponent } from './transcoding-profile-details/transcoding-profile-details.component';
import { TranscodingProfileMetadataComponent } from './transcoding-profile-metadata/transcoding-profile-metadata.component';
import { TranscodingProfileTypePipe } from './pipes/transcoding-profile-type-icon.pipe';

export const TranscodingProfileComponentsList = [
  TranscodingProfileComponent,
  TranscodingProfileSectionsListComponent,
  TranscodingProfileDetailsComponent,
  TranscodingProfileMetadataComponent,
  TranscodingProfileTypePipe
];
