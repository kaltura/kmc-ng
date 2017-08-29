import {Route} from '@angular/router';

import {AdministrationRolesComponent} from './administration-roles.component';
import {RolesListComponent} from './roles/roles-list.component';

export const routing: Route[] = [
  {
    path: '', component: AdministrationRolesComponent,
    children: [
      {path: '', redirectTo: 'list', pathMatch: 'full'},
      {path: 'list', component: RolesListComponent},
      // {
      //   path: 'role/:id', component: RoleComponent,
      //   data: {
      //     entryRoute: true
      //   }
      // }
    ]
  },
];
