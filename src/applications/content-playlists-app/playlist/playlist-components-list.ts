import { PlaylistMetadataComponent } from './playlist-metadata/playlist-metadata.component';
import { ManualContentComponent } from './playlist-content/manual/manual-content.component';
import { PlaylistSectionsList } from './playlist-sections-list/playlist-sections-list.component';
import { PlaylistComponent } from './playlist.component';
import { PlaylistDetailsComponent } from './playlist-details/playlist-details.component';
import { PlaylistEntriesTableComponent } from './playlist-content/manual/playlist-entries-table/playlist-entries-table.component';
import { PlaylistAddEntryComponent } from './playlist-add-entry/playlist-add-entry.component';
import { ModerationPipe } from './pipes/moderation.pipe';

import { EntryTypePipe } from './pipes/entry-type.pipe';
import { EntryDurationPipe } from './pipes/entry-duration.pipe';
import { BulkOperationsComponent } from './playlist-content/manual/bulk-operations/bulk-operations.component';
import { RuleBasedContentComponent } from './playlist-content/rule-based/rule-based-content.component';
import { PlaylistContentComponent } from './playlist-content/playlist-content.component';
import { PlaylistRulesTableComponent } from './playlist-content/rule-based/playlist-rules-table/playlist-rules-table.component';
import { PlaylistOrderByPipe } from './playlist-content/rule-based/playlist-rules-table/playlist-rules-order-by.pipe';
import { RuleBasedBulkOperationsComponent } from './playlist-content/rule-based/bulk-operations/bulk-operations.component';
import { PlaylistRuleComponent } from './playlist-content/rule-based/playlist-rule/playlist-rule.component';

export const PlaylistComponentsList = [
  PlaylistMetadataComponent,
  PlaylistContentComponent,
  ManualContentComponent,
  RuleBasedContentComponent,
  PlaylistSectionsList,
  PlaylistComponent,
  PlaylistDetailsComponent,
  PlaylistEntriesTableComponent,
  PlaylistRulesTableComponent,
  PlaylistAddEntryComponent,
  RuleBasedBulkOperationsComponent,
  ModerationPipe,
  EntryTypePipe,
  EntryDurationPipe,
  PlaylistOrderByPipe,
  BulkOperationsComponent,
  PlaylistRuleComponent
];
