import {Route} from '@angular/router';
import {AnalyticsKavaComponent} from './analytics-kava.component';

export const routing: Route[] = [
	{path: '', redirectTo: 'live', pathMatch: 'full'},
	{path: 'live', component: AnalyticsKavaComponent}
];
