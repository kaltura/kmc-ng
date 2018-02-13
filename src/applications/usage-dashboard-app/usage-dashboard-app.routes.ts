import {Route} from '@angular/router';

import {UsageDashboardComponent} from './usage-dashboard.component';


export const routing: Route[] = [
  {
    path: '', component: UsageDashboardComponent, children: []
  },
];
