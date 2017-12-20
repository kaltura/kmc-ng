import { PlaylistsListComponent } from './playlists-list/playlists-list.component';
import { PlaylistsTableComponent } from './playlists-table/playlists-table.component';
import { PlaylistTypePipe } from './pipes/playlist-type.pipe';
import { PlaylistsAdditionalFiltersComponent } from './playlists-additional-filters/playlists-additional-filters.component';
import { AddNewPlaylistComponent } from './add-new-playlist/add-new-playlist.component';
import { PlaylistsTagsComponent } from './playlists-tags/playlists-tags.component';

export const PlaylistsComponentsList = [
  PlaylistsListComponent,
  PlaylistsTableComponent,
  PlaylistsAdditionalFiltersComponent,
  AddNewPlaylistComponent,
  PlaylistsTagsComponent,
  PlaylistTypePipe,
];
