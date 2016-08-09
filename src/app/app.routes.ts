import { provideRouter, RouterConfig } from '@angular/router';
import { LoginComponent } from "./kmc-apps/kmc-shell-app/components/login/login.component";
import { DashboardComponent as StubDashboardComponent  } from "./kmc-apps/stub-app/components/dashboard/dashboard.component";
import { EntriesComponent as ContentEntries } from "./kmc-apps/content-app/components/entries/entries.component";
import { DashboardComponent } from "./kmc-apps/kmc-shell-app/components/dashboard/dashboard.component";
import { UniversalStudioComponent } from "./kmc-apps/studio-app/components/universal-studio/universal-studio.component";
import { ConfigCanActivate } from './kmc-apps/kmc-shell-app/shared';
import {AuthCanActivate} from "./shared/@kmc/auth/auth-can-activate.service";


const routes: RouterConfig = [
  {
    path: '', canActivate: [ConfigCanActivate],
    children: [

      {path: 'login', component: LoginComponent},
      {
        path: '', component: DashboardComponent,
        canActivate : [AuthCanActivate],
        children: [
          {path: 'content', component: StubDashboardComponent},
          {path: 'dashboard', component: StubDashboardComponent},
          {path: 'studio', component: UniversalStudioComponent}
        ]
      },
      {
        path: '', redirectTo: '/login', pathMatch: 'full'
      }
    ]
  }
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
