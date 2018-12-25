import { Route } from '@angular/router';
import { AnalyticsComponent } from './analytics.component';

export const routing: Route[] = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'liveAnalytics',
        loadChildren: '../../applications/analytics-live-app/analytics-live-app.module#AnalyticsLiveAppModule'
    },
    {
        path: ':group',
        component: AnalyticsComponent
    }
];
