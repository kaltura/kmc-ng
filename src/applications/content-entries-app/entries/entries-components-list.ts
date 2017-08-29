import { EntriesListComponent } from './entries-list.component';
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
  EntriesListComponent,
  BulkActionsComponent,
  BulkScheduling,
  BulkAAccessControl,
  BulkAddTags,
  BulkRemoveTags,
  BulkChangeOwner,
  BulkRemoveCategories,
  BulkDownload
];
