import {Route} from '@angular/router';

import {AnalyticsComponent} from './analytics.component';


export const routing: Route[] = [
  {
    path: '', component: AnalyticsComponent, children: []
  },
];
