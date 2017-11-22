import { PlaylistsListComponent } from './playlists-list.component';
import { PlaylistsTableComponent } from './playlists-table.component';
import { PlaylistTypePipe } from './pipes/playlist-type.pipe';
import { PlaylistsAdditionalFiltersComponent } from './playlists-additional-filters/playlists-additional-filters.component';
import { AddNewPlaylistComponent } from './add-new-playlist/add-new-playlist.component';

export const PlaylistsComponentsList = [
  PlaylistsListComponent,
  PlaylistsTableComponent,
  PlaylistsAdditionalFiltersComponent,
  AddNewPlaylistComponent,
  PlaylistTypePipe,
];
