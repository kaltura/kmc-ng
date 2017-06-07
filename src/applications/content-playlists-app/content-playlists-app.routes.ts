import { Route } from '@angular/router';

import { PlaylistsListComponent } from './playlists';

export const routing: Route[] = [
	{path: '', redirectTo: 'list', pathMatch: 'full'},
	{path: 'list', component: PlaylistsListComponent}
];
