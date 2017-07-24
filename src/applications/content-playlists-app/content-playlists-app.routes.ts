import { Route } from '@angular/router';

import { PlaylistsListComponent } from './playlists/playlists-list.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { PlaylistMetadataComponent } from './playlist/playlist-metadata/playlist-metadata.component';
import { PlaylistContentComponent } from './playlist/playlist-content/playlist-content.component';
import { PlaylistSections } from './playlist/playlist-sections';
import { EntryCanDeactivate } from './playlist/entry-can-deactivate.service';

export const routing: Route[] = [
	{path: '', redirectTo: 'list', pathMatch: 'full'},
	{path: 'list', component: PlaylistsListComponent},
	{path: 'playlist/:id', canDeactivate: [EntryCanDeactivate], component: PlaylistComponent,
		data : {
			playlistRoute : true
		},
		children : [
			{ path: '', redirectTo: 'content', pathMatch: 'full' },
			{ path: 'metadata', component: PlaylistMetadataComponent, data : { sectionKey : PlaylistSections.Metadata } },
			{ path: 'content', component: PlaylistContentComponent, data : { sectionKey : PlaylistSections.Content } }
		]
	}
];
