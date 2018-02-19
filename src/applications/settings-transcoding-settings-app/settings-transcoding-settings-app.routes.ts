import { Route } from '@angular/router';
import { SettingsTranscodingSettingsComponent } from './settings-transcoding-settings.component';
import { TranscodingProfilesListsHolderComponent } from './transcoding-profiles-lists-holder/transcoding-profiles-lists-holder.component';

export const routing: Route[] = [
  {
    path: '', component: SettingsTranscodingSettingsComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: TranscodingProfilesListsHolderComponent }
    ]
  }
];
