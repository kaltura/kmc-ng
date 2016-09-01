import { Routes, RouterModule } from '@angular/router';

import {load} from './shared/async-ng-module-loader';
import { LoginComponent } from "./kmc-apps/kmc-shell-app/components/login/login.component";
import { DashboardComponent } from "./kmc-apps/kmc-shell-app/components/dashboard/dashboard.component";
import { ConfigCanActivate } from './kmc-apps/kmc-shell-app/shared';
import { AuthCanActivate } from "./shared/@kmc/auth/auth-can-activate.service";

const routes: Routes = [
  {
    path: '', canActivate: [ConfigCanActivate],
    children: [

      { path: 'login', component: LoginComponent },
      {
        path: '', component: DashboardComponent, canActivate:[AuthCanActivate], children: [
        { path: 'content', children:[
          { path: '', redirectTo: 'entries', pathMatch: 'full' },
          { path: 'entries', loadChildren: load(() => new Promise(resolve => {
            (require as any).ensure([], require => {
              resolve(require('./kmc-apps/content-entries-app/content-entries-app.module').ContentEntriesAppModule);
            });
          }))},
          { path: 'moderation', loadChildren: load(() => new Promise(resolve => {
            (require as any).ensure([], require => {
              resolve(require('./kmc-apps/content-moderation-app/content-moderation-app.module').ContentModerationAppModule);
            });
          }))},
          { path: 'playlists', loadChildren: load(() => new Promise(resolve => {
            (require as any).ensure([], require => {
              resolve(require('./kmc-apps/content-playlists-app/content-playlists-app.module').ContentPlaylistsAppModule);
            });
          }))}
        ]},
        { path: 'dashboard', loadChildren: load(() => new Promise(resolve => {
          (require as any).ensure([], require => {
            resolve(require('./kmc-apps/dashboard-app/dashboard-app.module').DashboardAppModule);
          });
        }))},
        { path: 'studio', loadChildren: load(() => new Promise(resolve => {
          (require as any).ensure([], require => {
            resolve(require('./kmc-apps/studio-universal-app/studio-universal-app.module').StudioUniversalAppModule);
          });
        }))}
      ]
      },
      {
        path: '', redirectTo: '/login', pathMatch: 'full'
      }
    ]
  }
];

export const routing = RouterModule.forRoot(routes);


