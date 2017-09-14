import { Route } from '@angular/router';

import { StudioComponent } from './studio.component';


export const routing: Route[] = [
  {
    path: '', component: StudioComponent, children: []
  },
];
