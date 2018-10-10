import { Route } from '@angular/router';
import {AnalyticsComponent} from './analytics.component';

export const routing: Route[] = [
    {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    {path: ':group', component: AnalyticsComponent}
];
