import { TranscodingProfileSectionsListComponent } from './transcoding-profile-sections-list/transcoding-profile-sections-list.component';
import { TranscodingProfileComponent } from './transcoding-profile.component';
import { TranscodingProfileDetailsComponent } from './transcoding-profile-details/transcoding-profile-details.component';
import { TranscodingProfileMetadataComponent } from './transcoding-profile-metadata/transcoding-profile-metadata.component';
import { TranscodingProfileTypePipe } from './pipes/transcoding-profile-type-icon.pipe';
import { TranscodingProfileFlavorsComponent } from './transcoding-profile-flavors/transcoding-profile-flavors.component';
import { TranscodingProfileFlavorsTableComponent } from './transcoding-profile-flavors/transcoding-profile-flavors-table/transcoding-profile-flavors-table.component';
import { AddNewProfileComponent } from '../add-new-profile/add-new-profile.component';

export const TranscodingProfileComponentsList = [
  TranscodingProfileComponent,
  TranscodingProfileSectionsListComponent,
  TranscodingProfileDetailsComponent,
  TranscodingProfileMetadataComponent,
  TranscodingProfileFlavorsComponent,
  TranscodingProfileFlavorsTableComponent,
  AddNewProfileComponent,
  TranscodingProfileTypePipe
];
