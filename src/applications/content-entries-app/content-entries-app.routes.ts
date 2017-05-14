import { Route }        from '@angular/router';

import { EntriesComponent } from './entries/entries.component';
import { EntriesListComponent } from './entries/entries-list.component';
import { EntryComponent } from './entry/entry.component';
import { EntryMetadata } from "./entry/entry-metadata/entry-metadata.component";
import { EntryUsers } from "./entry/entry-users/entry-users.component";
import { EntrySectionTypes } from './entry/entry-store/entry-sections-types';
import { EntryClips } from './entry/entry-clips/entry-clips.component';
import { EntryRelated } from './entry/entry-related/entry-related.component';
import { EntryLive } from './entry/entry-live/entry-live.component';
import { EntryCaptions } from './entry/entry-captions/entry-captions.component';
import { EntryFlavours } from './entry/entry-flavours/entry-flavours.component';
import { EntryScheduling } from './entry/entry-scheduling/entry-scheduling.component';
import { EntryAccessControl } from './entry/entry-access-control/entry-access-control.component';
import { EntryThumbnails } from './entry/entry-thumbnails/entry-thumbnails.component';

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
					{ path: 'metadata', component: EntryMetadata, data : { sectionType : EntrySectionTypes.Metadata } },
					{ path: 'thumbnails', component: EntryThumbnails, data : { sectionType : EntrySectionTypes.Thumbnails } },
					{ path: 'accesscontrol', component: EntryAccessControl, data : { sectionType : EntrySectionTypes.AccessControl } },
					{ path: 'scheduling', component: EntryScheduling, data : { sectionType : EntrySectionTypes.Scheduling } },
					{ path: 'flavours', component: EntryFlavours, data : { sectionType : EntrySectionTypes.Flavours } },
					{ path: 'captions', component: EntryCaptions, data : { sectionType : EntrySectionTypes.Captions } },
					{ path: 'live', component: EntryLive, data : { sectionType : EntrySectionTypes.Live } },
					{ path: 'related', component: EntryRelated, data : { sectionType : EntrySectionTypes.Related } },
					{ path: 'clips', component: EntryClips, data : { sectionType : EntrySectionTypes.Clips } },
					{ path: 'users', component: EntryUsers, data : { sectionType : EntrySectionTypes.Users } }
				]
			}
	]},

];
