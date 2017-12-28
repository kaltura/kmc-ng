import { RouterModule, Routes } from '@angular/router';
import { AppBootstrap, AuthCanActivate } from 'app-shared/kmc-shell';

import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ErrorComponent } from './components/error/error.component';


const routes: Routes = <Routes>[
  {
    path: 'error', component: ErrorComponent
  },
  {
    path: '', canActivate: [AppBootstrap], component: DashboardComponent, children: [
      {
          path: '',
          loadChildren: '../applications/analytics-live-app/analytics-live-app.module#AnalyticsLiveAppModule'
      }
  ]
  }
];

export const routing = RouterModule.forRoot(routes);
