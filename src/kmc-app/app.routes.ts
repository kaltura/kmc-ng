import { RouterModule, Routes } from '@angular/router';
import { AppBootstrap, AuthCanActivate } from 'app-shared/kmc-shell';

import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ErrorComponent } from './components/error/error.component';
import { AppDefaultViewComponent } from './components/app-default-view/app-default-view.component';
import { LoginByKSComponent } from './components/app-actions/login-by-ks.component';
import { RestorePasswordComponent } from './components/app-actions/restore-password.component';
import { NotFoundPageComponent } from './components/not-found-page/not-found-page.component';
import { PersistLoginByKsComponent } from './components/app-actions/persist-login-by-ks.component';

const routes: Routes = <Routes>[
    {
        path: 'error', component: ErrorComponent
    },
    {
        path: '', canActivate: [AppBootstrap],
        children: [
            {
                path: 'actions',
                children: [
                    { path: 'login-by-ks/:ks', component: LoginByKSComponent, pathMatch: 'full' },
                    { path: 'persist-login-by-ks/:ks', component: PersistLoginByKsComponent, pathMatch: 'full' },
                    { path: 'restore-password/:hash', component: RestorePasswordComponent, pathMatch: 'full'  }
                ]
            },
            {
                path: 'login', component: LoginComponent
            },
            {
                path: '', component: AppDefaultViewComponent, pathMatch: 'full'
            },
            {
                path: '',  component: DashboardComponent, canActivate: [AuthCanActivate],
                children: [
                    {
                        path: 'content', children: [
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
                            path: 'syndication',
                            loadChildren: '../applications/content-syndication-app/content-syndication-app.module#ContentSyndicationAppModule'
                        },
                        {
                            path: 'upload-control',
                            loadChildren: '../applications/content-upload-control-app/content-upload-control-app.module#ContentUploadControlAppModule'
                        },
                        {
                            path: 'drop-folders',
                            loadChildren: '../applications/content-drop-folders-app/content-drop-folders-app.module#ContentDropFoldersAppModule'
                        },
                        {
                            path: 'bulk',
                            loadChildren: '../applications/content-bulk-log-app/content-bulk-log-app.module#ContentBulkLogAppModule'
                        },
                        {
                            path: 'moderation',
                            loadChildren: '../applications/content-moderation-app/content-moderation-app.module#ContentModerationAppModule'
                        }
                    ]
                    },
                    {
                        path: 'settings', children: [
                        {
                            path: 'accountSettings',
                            loadChildren: '../applications/settings-account-settings-app/settings-account-settings-app.module#SettingsAccountSettingsAppModule'
                        },
                        {
                            path: 'integrationSettings',
                            loadChildren: '../applications/settings-integration-settings-app/settings-integration-settings-app.module#SettingsIntegrationSettingsAppModule'
                        },
                        {
                            path: 'accountInformation',
                            loadChildren: '../applications/settings-account-information-app/settings-account-information-app.module#SettingsAccountInformationAppModule'
                        },
                        {
                            path: 'accessControl',
                            loadChildren: '../applications/settings-access-control-app/settings-access-control-app.module#SettingsAccessControlAppModule'
                        },
                        {
                            path: 'metadata',
                            loadChildren: '../applications/settings-custom-data-app/settings-custom-data-app.module#SettingsCustomDataAppModule'
                        },
                        {
                            path: 'myUserSettings',
                            loadChildren: '../applications/settings-my-user-settings-app/settings-my-user-settings-app.module#SettingsMyUserSettingsAppModule'
                        },
                        {
                            path: 'transcoding',
                            loadChildren: '../applications/settings-transcoding-settings-app/settings-transcoding-settings-app.module#SettingsTranscodingSettingsAppModule'
                        }
                    ]
                    },
                    {
                        path: 'administration', children: [
                        {
                            path: 'roles',
                            loadChildren: '../applications/administration-roles-app/administration-roles-app.module#AdministrationRolesAppModule'
                        },
                        {
                            path: 'users',
                            loadChildren: '../applications/administration-users-app/administration-users-app.module#AdministrationUsersAppModule'
                        }
                    ]
                    },
                    { path: 'studio', loadChildren: '../applications/studio-app/studio-app.module#StudioAppModule' },
                    {
                        path: 'usageDashboard',
                        loadChildren: '../applications/usage-dashboard-app/usage-dashboard-app.module#UsageDashboardAppModule'
                    },
                    {
                        path: 'analytics', children: [
                        {
                            path: 'kava',
                            loadChildren: '../applications/analytics-kava-app/analytics-kava-app.module#AnalyticsKavaAppModule'
                        },
                        {
                            path: 'liveAnalytics',
                            loadChildren: '../applications/analytics-live-app/analytics-live-app.module#AnalyticsLiveAppModule'
                        },
                    ]
                    },
                    {
                        path: '**', component: NotFoundPageComponent
                    }
                ]
            },
            {
                path: '**', component: NotFoundPageComponent
            }
        ]
    },
    {
        path: '**', component: NotFoundPageComponent
    }
];

export const routing = RouterModule.forRoot(routes);
