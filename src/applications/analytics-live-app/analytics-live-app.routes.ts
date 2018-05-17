import {Route} from '@angular/router';
import {AnalyticsLiveComponent} from './analytics-live.component';

export const routing: Route[] = [
	{path: '', redirectTo: 'live', pathMatch: 'full'},
	{path: 'live', component: AnalyticsLiveComponent}
];
