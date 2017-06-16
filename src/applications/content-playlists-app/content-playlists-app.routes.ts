import { Route } from '@angular/router';

import { PlaylistsListComponent } from './playlists/playlists-list.component';
import { PlaylistComponent } from './playlist/playlist.component'

export const routing: Route[] = [
	{path: '', redirectTo: 'list', pathMatch: 'full'},
	{path: 'list', component: PlaylistsListComponent},
	{path: 'playlist/:id', component: PlaylistComponent}
];
