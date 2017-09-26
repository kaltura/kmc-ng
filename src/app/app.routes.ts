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
    path: '', canActivate: [AppBootstrap],
    children: [
      { path: 'login', component: LoginComponent },
        {
            path: '', redirectTo: '/login', pathMatch: 'full'
        },
      {
        path: '', component: DashboardComponent, canActivate: [AuthCanActivate], children: [
        {
          path: 'content', children: [
          { path: '', redirectTo: 'entries', pathMatch: 'full' },
          {
            path: 'entries',
            loadChildren: '../applications/content-entries-app/content-entries-app.module#ContentEntriesAppModule'
          },
          {
            path: 'playlists',
            loadChildren: '../applications/content-playlists-app/content-playlists-app.module#ContentPlaylistsAppModule'
          },
          {
            path: 'categories',
            loadChildren: '../applications/content-categories-app/content-categories-app.module#ContentCategoriesAppModule'
          },
          {
            path: 'upload-control',
            loadChildren: '../applications/content-upload-control-app/content-upload-control-app.module#ContentUploadControlAppModule'
          },
          {
            path: 'bulk',
            loadChildren: '../applications/content-bulk-log-app/content-bulk-log-app.module#ContentBulkLogAppModule'
          },
        ]},
        {
          path: 'settings', children: [
          { path: '', redirectTo: 'accountSettings', pathMatch: 'full' },
          {
            path: 'accountSettings',
            loadChildren: '../applications/settings-account-settings-app/settings-account-settings-app.module#SettingsAccountSettingsAppModule'
          },
          {
            path: 'accountUpgrade',
            loadChildren: '../applications/settings-account-upgrade-app/settings-account-upgrade-app.module#SettingsAccountUpgradeAppModule'
          }
        ]
        },
        {
          path: 'administration', children: [
          { path: '', redirectTo: 'roles', pathMatch: 'full' },
          {
            path: 'roles',
            loadChildren: '../applications/administration-roles-app/administration-roles-app.module#AdministrationRolesAppModule'
          },
        ]
        },
        { path: 'studio', loadChildren: '../applications/studio-app/studio-app.module#StudioAppModule' },
      ]
      }
    ]
  },
  {
    path: '**', redirectTo: '/login', pathMatch: 'full'
  }
];

export const routing = RouterModule.forRoot(routes);
