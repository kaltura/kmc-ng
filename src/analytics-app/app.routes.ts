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
            {path: 'login', component: LoginComponent},
            {
                path: '', redirectTo: '/analytics/live', pathMatch: 'full'
            },
            {
                path: '', component: DashboardComponent, canActivate: [AuthCanActivate], children: [
                    {path: '', redirectTo: 'analytics', pathMatch: 'full'},
                    {
                        path: 'analytics',
                        loadChildren: '../applications/analytics-live-app/analytics-live-app.module#AnalyticsLiveAppModule'
                    }
                ]
            }
        ]
    },
    {
        path: '**', redirectTo: '/analytics/live', pathMatch: 'full'
    }
];

export const routing = RouterModule.forRoot(routes);
