import {Route} from '@angular/router';
import {SettingsAuthenticationComponent} from './settings-authentication.component';
import {ProfilesListComponent} from "./profiles-list/profiles-list.component";

export const routing: Route[] = [
    {
        path: '', component: SettingsAuthenticationComponent,
        children: [
            { path: '', redirectTo: 'list', pathMatch: 'full' },
            { path: 'list', component: ProfilesListComponent }
        ]
    }
];
