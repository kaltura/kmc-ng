import { Routes, RouterModule } from '@angular/router';
import { AuthCanActivate, AppBootstrap } from '@kaltura-ng2/kaltura-common';

import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ErrorComponent } from "./components/error/error.component";


const routes: Routes = <Routes>[
  {
    path: 'error', component: ErrorComponent
  },
  {
    path: '', canActivate: [AppBootstrap],
    children: [

      { path: 'login', component: LoginComponent },
      {
        path: '', component: DashboardComponent, canActivate: [AuthCanActivate], children: [
        { path: 'content', children: [
          { path: '', redirectTo: 'entries', pathMatch: 'full' },
          { path: 'entries', loadChildren: () => '../applications/content-entries-app/content-entries-app.module#ContentEntriesAppModule' }
        ]}
      ]
      },
      {
        path: '**', redirectTo: '/login', pathMatch: 'full'
      }
    ]
  }
];

export const routing = RouterModule.forRoot(routes);


