import { Route } from '@angular/router';
import { SettingsReachComponent } from './settings-reach.component';
import { ReachProfilesListsHolderComponent } from './reach-profiles/reach-profiles-lists-holder/reach-profiles-lists-holder.component';
import { ReachProfileCanDeactivate } from "./reach-profile/reach-profile-can-deactivate.service";
import { ReachProfileComponent } from "./reach-profile/reach-profile.component";
import { ReachProfileSettingsComponent } from "./reach-profile/reach-profile-settings/reach-profile-settings.component";
import { ReachProfileServiceComponent } from "./reach-profile/reach-profile-service/reach-profile-service.component";
import { ReachProfileCreditComponent } from "./reach-profile/reach-profile-credit/reach-profile-credit.component";
import { ReachProfileDictionaryComponent } from "./reach-profile/reach-profile-dictionary/reach-profile-dictionary.component";
import { ReachProfileRulesComponent } from "./reach-profile/reach-profile-rules/reach-profile-rules.component";

export const routing: Route[] = [
    {
        path: '', component: SettingsReachComponent,
        children: [
            {path: '', redirectTo: 'list', pathMatch: 'full'},
            {path: 'list', component: ReachProfilesListsHolderComponent},
            {
                path: 'profile/:id',
                canDeactivate: [ReachProfileCanDeactivate],
                component: ReachProfileComponent,
                data: {profileRoute: true},
                children: [
                    {path: '', redirectTo: 'settings', pathMatch: 'full'},
                    {path: 'settings', component: ReachProfileSettingsComponent},
                    {path: 'service', component: ReachProfileServiceComponent},
                    {path: 'credit', component: ReachProfileCreditComponent},
                    {path: 'dictionary', component: ReachProfileDictionaryComponent},
                    {path: 'rules', component: ReachProfileRulesComponent}
                ]
            }
        ]
    }
];
