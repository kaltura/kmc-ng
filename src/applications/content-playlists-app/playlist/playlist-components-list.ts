import { PlaylistMetadataComponent } from './playlist-metadata/playlist-metadata.component';
import { PlaylistContentComponent } from './playlist-content/playlist-content.component';
import { PlaylistSectionsList } from './playlist-sections-list/playlist-sections-list.component';
import { PlaylistComponent } from './playlist.component';
import { PlaylistDetailsComponent } from './playlist-details/playlist-details.component';
import { PlaylistEntriesTableComponent } from './playlist-content/playlist-entries-table/playlist-entries-table.component';
import { PlaylistAddEntryComponent } from './playlist-add-entry/playlist-add-entry.component';
import { ModerationPipe } from './pipes/moderation.pipe';

import { EntryTypePipe } from './pipes/entry-type.pipe';
import { EntryDurationPipe } from './pipes/entry-duration.pipe';
import { BulkOperationsComponent } from './playlist-content/bulk-operations/bulk-operations.component';

export const PlaylistComponentsList = [
  PlaylistMetadataComponent,
  PlaylistContentComponent,
  PlaylistSectionsList,
  PlaylistComponent,
  PlaylistDetailsComponent,
  PlaylistEntriesTableComponent,
  PlaylistAddEntryComponent,
  ModerationPipe,
  EntryTypePipe,
  EntryDurationPipe,
  BulkOperationsComponent
];
