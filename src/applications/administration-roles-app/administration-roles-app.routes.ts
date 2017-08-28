import {Route} from '@angular/router';

import {ContentRolesComponent} from './administration-roles.component';
import {RolesListComponent} from './roles/roles-list.component';

export const routing: Route[] = [
  {
    path: '', component: ContentRolesComponent,
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
