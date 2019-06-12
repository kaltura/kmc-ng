import { Route } from '@angular/router';

import { ServicesDashboardComponent } from './services-dashboard.component';


export const routing: Route[] = [
    { path: '', component: ServicesDashboardComponent, children: [] },
];
