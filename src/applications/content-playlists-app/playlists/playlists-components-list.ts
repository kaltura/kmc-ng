import { PlaylistsListComponent } from "./playlists-list.component";
import { PlaylistsTableComponent } from './playlists-table.component';
import { PlaylistTypePipe } from './pipes';
import { PlaylistsAdditionalFiltersComponent } from "./playlists-additional-filters";

export const PlaylistsComponentsList = [
    PlaylistsListComponent,
	PlaylistsTableComponent,
	PlaylistsAdditionalFiltersComponent,
	PlaylistTypePipe
];
