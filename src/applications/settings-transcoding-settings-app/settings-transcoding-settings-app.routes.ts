import { Route } from '@angular/router';
import { SettingsTranscodingSettingsComponent } from './settings-transcoding-settings.component';
import { TranscodingProfilesListsHolderComponent } from './transcoding-profiles/transcoding-profiles-lists-holder/transcoding-profiles-lists-holder.component';
import { TranscodingProfileCanDeactivate } from './transcoding-profile/transcoding-profile-can-deactivate.service';
import { TranscodingProfileComponent } from './transcoding-profile/transcoding-profile.component';
import { TranscodingProfileMetadataComponent } from './transcoding-profile/transcoding-profile-metadata/transcoding-profile-metadata.component';
import { TranscodingProfileFlavorsComponent } from './transcoding-profile/transcoding-profile-flavors/transcoding-profile-flavors.component';

export const routing: Route[] = [
  {
    path: '', component: SettingsTranscodingSettingsComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: TranscodingProfilesListsHolderComponent },
      {
        path: 'profile/:id', canDeactivate: [TranscodingProfileCanDeactivate], component: TranscodingProfileComponent,
        data: { profileRoute: true },
        children: [
          { path: '', redirectTo: 'metadata', pathMatch: 'full' },
          { path: 'metadata', component: TranscodingProfileMetadataComponent },
          { path: 'flavors', component: TranscodingProfileFlavorsComponent }
        ]
      }
    ]
  }
];
