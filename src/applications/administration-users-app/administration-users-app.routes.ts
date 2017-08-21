import { Route }        from '@angular/router';

import { UsersComponent } from './users/users.component';
import { AdministrationUsersComponent } from './administration-users.component';

export const routing: Route[] = [
	{path: '', component: AdministrationUsersComponent,
		children:[
			{path: '', redirectTo: 'users', pathMatch: 'full'},
			{path: 'users', component: UsersComponent}
	]},

];
