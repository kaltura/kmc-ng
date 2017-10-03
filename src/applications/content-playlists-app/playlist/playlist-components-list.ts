import { PlaylistMetadataComponent } from './playlist-metadata/playlist-metadata.component';
import { PlaylistContentComponent } from './playlist-content/playlist-content.component';
import { PlaylistSectionsList } from "./playlist-sections-list/playlist-sections-list.component";
import { PlaylistComponent } from './playlist.component';
import { PlaylistDetailsComponent } from './playlist-details/playlist-details.component';
import { PlaylistEntriesTableComponent } from './playlist-entries-table/playlist-entries-table.component';
import { ModerationPipe } from './pipes/moderation.pipe';

export const PlaylistComponentsList = [
	PlaylistMetadataComponent,
	PlaylistContentComponent,
	PlaylistSectionsList,
	PlaylistComponent,
	PlaylistDetailsComponent,
    PlaylistEntriesTableComponent,
    ModerationPipe
];
