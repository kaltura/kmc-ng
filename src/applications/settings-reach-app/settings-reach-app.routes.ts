import { Route } from '@angular/router';
import { SettingsReachComponent } from './settings-reach.component';
import { ReachProfilesListsHolderComponent } from './reach-profiles/reach-profiles-lists-holder/reach-profiles-lists-holder.component';

export const routing: Route[] = [
  {
    path: '', component: SettingsReachComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: ReachProfilesListsHolderComponent }
    ]
  }
];
