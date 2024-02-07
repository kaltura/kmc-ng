import {Route} from '@angular/router';
import {SettingsMrComponent} from './settings-mr.component';
import {RulesComponent} from "./rules/rules.component";

export const routing: Route[] = [
    {
        path: '', component: SettingsMrComponent,
        children: [
            { path: '', redirectTo: 'rules', pathMatch: 'full' },
            { path: 'rules', component: RulesComponent }
        ]
    }
];
