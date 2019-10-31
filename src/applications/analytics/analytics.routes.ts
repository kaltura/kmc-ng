import { Route } from '@angular/router';
import { AnalyticsComponent } from './analytics.component';

export const routing: Route[] = [
    {
        path: '',
        redirectTo: 'engagement',
        pathMatch: 'full'
    },
    {
        path: 'liveAnalytics',
        loadChildren: () => import('../../applications/analytics-live-app/analytics-live-app.module').then(m => m.AnalyticsLiveAppModule)
    },
    {
        path: ':group',
        component: AnalyticsComponent
    }
];
