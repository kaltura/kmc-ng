import { ModuleWithProviders } from '@angular/core';
import { RouterModule }        from '@angular/router';

import { EntriesComponent } from './entries/entries.component';
import { EntryDetailsComponent } from './components/entry-details/entry-details.component';
import {EntryMetadata} from "./entry-metadata/entry-metadata.component";
import {EntryUsers} from "./entry-users/entry-users.component";

export const routing: ModuleWithProviders = RouterModule.forChild([
	{path: '', component: EntriesComponent},
	{path: 'entry/:id', component: EntryDetailsComponent,
		children : [
			{path: 'metadata', component: EntryMetadata},
			{path: 'users', component: EntryUsers}
		]
	}
]);
