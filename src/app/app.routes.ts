import { Routes, RouterModule } from '@angular/router';
import { AuthCanActivate, AppBootstrap } from '@kaltura-ng2/kaltura-common';

import { LoginComponent } from './shell/components/login/login.component';
import { DashboardComponent } from './shell/components/dashboard/dashboard.component';
import {ErrorComponent} from "./shell/components/error/error.component";


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
          { path: 'entries', loadChildren: () => new Promise(resolve => {
            (require as any).ensure([], require => {
              resolve(require('./applications/content-entries-app/content-entries-app.module').ContentEntriesAppModule);
            });
          })},
          { path: 'moderation', loadChildren: () => new Promise(resolve => {
            (require as any).ensure([], require => {
              resolve(require('./applications/content-moderation-app/content-moderation-app.module').ContentModerationAppModule);
            });
          })},
          { path: 'playlists', loadChildren: () => new Promise(resolve => {
            (require as any).ensure([], require => {
              resolve(require('./applications/content-playlists-app/content-playlists-app.module').ContentPlaylistsAppModule);
            });
          })}
        ]},
        { path: 'dashboard', loadChildren: () => new Promise(resolve => {
          (require as any).ensure([], require => {
            resolve(require('./applications/dashboard-app/dashboard-app.module').DashboardAppModule);
          });
        })},
        { path: 'studio', loadChildren: () => new Promise(resolve => {
          (require as any).ensure([], require => {
            resolve(require('./applications/studio-universal-app/studio-universal-app.module').StudioUniversalAppModule);
          });
        })}
      ]
      },
      {
        path: '**', redirectTo: '/login', pathMatch: 'full'
      }
    ]
  }
];

export const routing = RouterModule.forRoot(routes);


