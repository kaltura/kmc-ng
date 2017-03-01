import { Route }        from '@angular/router';

import { EntriesComponent } from './entries/entries.component';
import { EntriesListComponent } from './entries/entries-list.component';
import { EntryComponent } from './entry/entry.component';
import { EntryMetadata } from "./entry-metadata/entry-metadata.component";
import { EntryUsers } from "./entry-users/entry-users.component";

export const routing: Route[] = [
	{path: '', component: EntriesComponent,
		children:[
			{path: '', redirectTo: 'list', pathMatch: 'full'},
			{path: 'list', component: EntriesListComponent},
			{path: 'entry/:id', component: EntryComponent,
				data : {
					entryRootBase : true
				},
				children : [
					{path: '', redirectTo: 'metadata', pathMatch: 'full'},
					{path: 'metadata', component: EntryMetadata},
					{path: 'users', component: EntryUsers}
				]
			}
	]},

];
