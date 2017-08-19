import { PlaylistMetadataComponent } from './playlist-metadata/playlist-metadata.component';
import { PlaylistContentComponent } from './playlist-content/playlist-content.component';
import { PlaylistSectionsList } from "./playlist-sections-list/playlist-sections-list.component";
import { PlaylistComponent } from './playlist.component';
import { PlaylistDetailsComponent } from './playlist-details/playlist-details.component';
import { PlaylistEntriesTableComponent } from './playlist-entries-table/playlist-entries-table.component';
import { ModerationPipe } from './pipes/moderation.pipe';
import { PlaylistAddEntryComponent } from './playlist-add-entry/playlist-add-entry.component';
import { EntriesTableComponent } from './playlist-add-entry/entries-table.component';
import { EntryDurationPipe } from '../shared/pipes/entry-duration.pipe';
import { BulkActionsComponent } from './bulk-actions/bulk-actions.component';
import {
  BulkScheduling,
  BulkAAccessControl,
  BulkAddTags,
  BulkRemoveTags,
  BulkChangeOwner,
  BulkRemoveCategories,
  BulkDownload
} from './bulk-actions/components/';
import { CategoriesSelector } from './category-selector/categories-selector.component';
import { CategoryTooltip } from './category-selector/category-tooltip.pipe';
import { MaxEntriesPipe } from './pipes/max-entries.pipe';

export const PlaylistComponentsList = [
	PlaylistMetadataComponent,
	PlaylistContentComponent,
	PlaylistSectionsList,
	PlaylistComponent,
	PlaylistDetailsComponent,
  PlaylistEntriesTableComponent,
  PlaylistAddEntryComponent,
  EntriesTableComponent,
  BulkActionsComponent,
  BulkActionsComponent,
  BulkScheduling,
  BulkAAccessControl,
  BulkAddTags,
  BulkRemoveTags,
  BulkChangeOwner,
  BulkRemoveCategories,
  BulkDownload,
  CategoriesSelector,
  CategoryTooltip,
  ModerationPipe,
  EntryDurationPipe,
  MaxEntriesPipe
];
