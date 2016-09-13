import { Routes, RouterModule } from '@angular/router';
import { AuthCanActivate, AppBootstrap } from '@kaltura/kmcng-core';

import { LoginComponent } from './kmc-shell/components/login/login.component';
import { DashboardComponent } from './kmc-shell/components/dashboard/dashboard.component';
import {ErrorComponent} from "./kmc-shell/components/error/error.component";


const routes: Routes = <Routes>[
  {
    path: '', canActivate: [AppBootstrap],
    children: [

      { path: 'login', component: LoginComponent },
      {
        path: '', component: DashboardComponent, canActivate: [AuthCanActivate], children: [
        { path: 'content', children: [
          { path: '', redirectTo: 'entries', pathMatch: 'full' },
          { path: 'entries', loadChildren: () => new Promise(resolve => {
            (require as any).ensure([], require => {
              resolve(require('./kmc-apps/content-entries-app/content-entries-app.module').ContentEntriesAppModule);
            });
          })},
          { path: 'moderation', loadChildren: () => new Promise(resolve => {
            (require as any).ensure([], require => {
              resolve(require('./kmc-apps/content-moderation-app/content-moderation-app.module').ContentModerationAppModule);
            });
          })},
          { path: 'playlists', loadChildren: () => new Promise(resolve => {
            (require as any).ensure([], require => {
              resolve(require('./kmc-apps/content-playlists-app/content-playlists-app.module').ContentPlaylistsAppModule);
            });
          })}
        ]},
        { path: 'dashboard', loadChildren: () => new Promise(resolve => {
          (require as any).ensure([], require => {
            resolve(require('./kmc-apps/dashboard-app/dashboard-app.module').DashboardAppModule);
          });
        })},
        { path: 'studio', loadChildren: () => new Promise(resolve => {
          (require as any).ensure([], require => {
            resolve(require('./kmc-apps/studio-universal-app/studio-universal-app.module').StudioUniversalAppModule);
          });
        })}
      ]
      },
      {
        path: '', redirectTo: '/dashboard', pathMatch: 'full'
      },
      {
        path: 'error', component: ErrorComponent
      }
    ]
  }
];

export const routing = RouterModule.forRoot(routes);


