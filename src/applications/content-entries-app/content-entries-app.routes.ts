import { Route }        from '@angular/router';

import { EntriesComponent } from './entries/entries.component';
import { EntriesListComponent } from './entries/entries-list.component';
import { EntryComponent } from './entry/entry.component';
import { EntryMetadata } from "./entry/entry-metadata/entry-metadata.component";
import { EntryUsers } from "./entry/entry-users/entry-users.component";
import { EntrySectionTypes } from './entry-store/entry-sections-types';

export const routing: Route[] = [
	{path: '', component: EntriesComponent,
		children:[
			{path: '', redirectTo: 'list', pathMatch: 'full'},
			{path: 'list', component: EntriesListComponent},
			{path: 'entry/:id', component: EntryComponent,
				data : {
					entryRoute : true
				},
				children : [
					{path: '', redirectTo: 'metadata', pathMatch: 'full'},
					{
						path: 'metadata',
						component: EntryMetadata,
						data : {
							sectionType : EntrySectionTypes.Metadata
						}
					},
					{
						path: 'users',
						component: EntryUsers,
						data : {
							sectionType : EntrySectionTypes.Users
						}
					}
				]
			}
	]},

];
