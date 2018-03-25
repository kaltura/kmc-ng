import {EntriesListHolderComponent} from './entries-list-holder.component';
import {BulkActionsComponent} from './bulk-actions/bulk-actions.component';
import {
  BulkAAccessControl,
  BulkAddEditorsComponent,
  BulkAddPublishersComponent,
  BulkAddTags,
  BulkChangeOwner,
  BulkDownload,
  BulkRemoveCategories,
  BulkRemoveEditorsComponent,
  BulkRemovePublishersComponent,
  BulkRemoveTags,
  BulkScheduling
} from './bulk-actions/components';

export const EntriesComponentsList = [
  EntriesListHolderComponent,
  BulkActionsComponent,
  BulkScheduling,
  BulkAAccessControl,
  BulkAddTags,
  BulkAddPublishersComponent,
  BulkRemovePublishersComponent,
  BulkAddEditorsComponent,
  BulkRemoveEditorsComponent,
  BulkRemoveTags,
  BulkChangeOwner,
  BulkRemoveCategories,
  BulkDownload
];
