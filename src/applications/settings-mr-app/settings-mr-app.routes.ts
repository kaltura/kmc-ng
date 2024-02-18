import {Route} from '@angular/router';
import {SettingsMrComponent} from './settings-mr.component';
import {RulesComponent} from "./rules/rules.component";
import {RuleComponent} from "./rule/rule.component";
import {ReviewComponent} from './review/review.component';
import {LogsComponent} from './logs/logs.component';
import {SettingsComponent} from './settings/settings.component';

export const routing: Route[] = [
    {
        path: '', component: SettingsMrComponent,
        children: [
            { path: '', redirectTo: 'rules', pathMatch: 'full' },
            { path: 'rules', component: RulesComponent },
            { path: 'review', component: ReviewComponent },
            { path: 'logs', component: LogsComponent },
            { path: 'settings', component: SettingsComponent }
        ]
    },
    { path: 'rule/:id', component: RuleComponent }
];
