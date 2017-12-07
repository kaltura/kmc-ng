import { Route } from '@angular/router';
import { AdministrationUsersComponent } from './administration-users.component';
import { UsersListComponent} from './users/users-list.component';

export const routing: Route[] = [
	{
	  path: '', component: AdministrationUsersComponent,
    children: [
      {path: '', redirectTo: 'list', pathMatch: 'full'},
      {path: 'list', component: UsersListComponent},
    ]
	}
];


