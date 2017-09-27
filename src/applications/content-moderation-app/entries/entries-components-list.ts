import { EntryReportComponent } from '../entry-report/entry-report.component';
import { ModerationPipe } from '../pipes/moderation.pipe';
import { FlagTypePipe } from '../pipes/flagType.pipe';
import { EntriesListHolderComponent } from './entries-list-holder.component';
import { BulkActionsComponent } from './bulk-actions/bulk-actions.component';
import {
  BulkAAccessControl,
  BulkAddTags,
  BulkChangeOwner,
  BulkDownload,
  BulkRemoveCategories,
  BulkRemoveTags,
  BulkScheduling
} from './bulk-actions/components';

export const EntriesComponentsList = [
  EntriesListHolderComponent,
  BulkActionsComponent,
  BulkScheduling,
  BulkAAccessControl,
  BulkAddTags,
  BulkRemoveTags,
  BulkChangeOwner,
  BulkRemoveCategories,
  BulkDownload,
  EntryReportComponent,
  ModerationPipe,
  FlagTypePipe
];
