import { provideRouter, RouterConfig } from '@angular/router';
import { LoginComponent } from "./kmc-apps/kmc-host-app/components/login/login.component";
import { DashboardComponent as StubDashboardComponent  } from "./kmc-apps/stub-app/components/dashboard/dashboard.component";
import { EntriesComponent as ContentEntries } from "./kmc-apps/content-app/components/entries/entries.component";
import { DashboardComponent } from "./kmc-apps/kmc-host-app/components/dashboard/dashboard.component";
import { UniversalStudioComponent } from "./kmc-apps/studio-app/components/universal-studio/universal-studio.component";


const routes: RouterConfig = [
  { path: 'login', component: LoginComponent },
  { path: 'app', component: DashboardComponent, children : [
    { path: 'content', component: StubDashboardComponent},
    { path: 'dashboard', component: StubDashboardComponent },
    { path: 'studio', component: UniversalStudioComponent }
  ] },
  {
    path : '', redirectTo : 'app/content', pathMatch : 'full'
  }

];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
