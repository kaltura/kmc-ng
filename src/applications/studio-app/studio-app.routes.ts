import { Route } from '@angular/router';

import { StudioV2Component } from './studio-v2.component';
import { StudioV7Component } from './studio-v7.component';


export const routing: Route[] = [
  { path: 'v2', component: StudioV2Component },
  { path: 'v3', component: StudioV7Component }
];
