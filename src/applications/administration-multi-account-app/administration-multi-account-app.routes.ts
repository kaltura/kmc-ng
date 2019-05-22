import { Route } from '@angular/router';

import { AdministrationMultiAccountComponent } from './administration-multi-account.component';
import { AccountsListComponent } from './accounts-list/accounts-list.component';

export const routing: Route[] = [
  {
    path: '', component: AdministrationMultiAccountComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: AccountsListComponent }
    ]
  },
];
