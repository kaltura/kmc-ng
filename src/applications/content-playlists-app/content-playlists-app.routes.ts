import { Route } from '@angular/router';

import { PlaylistsListComponent } from './playlists/playlists-list.component';

export const routing: Route[] = [
	{path: '', redirectTo: 'list', pathMatch: 'full'},
	{path: 'list', component: PlaylistsListComponent}
];
