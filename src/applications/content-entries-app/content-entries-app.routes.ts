import { Route }        from '@angular/router';

import { EntriesComponent } from './entries/entries.component';
import { EntriesListComponent } from './entries/entries-list.component';
import { EntryComponent } from './entry/entry.component';
import { EntryMetadata } from "./entry/entry-metadata/entry-metadata.component";
import { EntryThumbnails } from "./entry/entry-thumbnails/entry-thumbnails.component";
import { EntryAccessControl } from "./entry/entry-access-control/entry-access-control.component";
import { EntryScheduling } from "./entry/entry-scheduling/entry-scheduling.component";
import { EntryFlavours } from "./entry/entry-flavours/entry-flavours.component";
import { EntryCaptions } from "./entry/entry-captions/entry-captions.component";
import { EntryLive } from "./entry/entry-live/entry-live.component";
import { EntryRelated } from "./entry/entry-related/entry-related.component";
import { EntryClips } from "./entry/entry-clips/entry-clips.component";
import { EntryUsers } from "./entry/entry-users/entry-users.component";

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
					{path: 'thumbnails', component: EntryThumbnails},
					{path: 'accesscontrol', component: EntryAccessControl},
					{path: 'scheduling', component: EntryScheduling},
					{path: 'flavours', component: EntryFlavours},
					{path: 'captions', component: EntryCaptions},
					{path: 'live', component: EntryLive},
					{path: 'related', component: EntryRelated},
					{path: 'clips', component: EntryClips},
					{path: 'users', component: EntryUsers}
				]
			}
	]},

];
