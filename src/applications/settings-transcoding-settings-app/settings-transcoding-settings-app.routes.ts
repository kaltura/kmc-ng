import { Route } from '@angular/router';
import { SettingsTranscodingSettingsComponent } from './settings-transcoding-settings.component';
import { TranscodingProfilesListsHolderComponent } from './transcoding-profiles-lists-holder/transcoding-profiles-lists-holder.component';
import { TranscodingProfileCanDeactivate } from './transcoding-profile/transcoding-profile-can-deactivate.service';
import { TranscodingProfileComponent } from './transcoding-profile/transcoding-profile.component';
import { TranscodingProfileMetadataComponent } from './transcoding-profile/transcoding-profile-metadata/transcoding-profile-metadata.component';
import { TranscodingProfileWidgetKeys } from './transcoding-profile/transcoding-profile-widget-keys';

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
          { path: 'metadata', component: TranscodingProfileMetadataComponent, data: { sectionKey: TranscodingProfileWidgetKeys.Metadata } },
          // { path: 'flavors', component: EntryFlavours, data: { sectionKey: TranscodingProfileWidgetKeys.Flavors } }
        ]
      }
    ]
  }
];
