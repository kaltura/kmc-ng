import { DropFoldersListComponent } from './drop-folders-list.component';
import { DropFoldersListTableComponent } from './drop-folders-list-table.component';
import { FolderNamePipe } from './pipes/folder-name.pipe';
import { FolderFileStatusPipe } from './pipes/folder-file-status.pipe';
import { AdditionalFiltersComponent } from './additional-filters/additional-filters.component';
import { StatusesFilterComponent } from './statuses-filter/statuses-filter.component';
import { StatusesTreeComponent } from "applications/content-drop-folders-app/drop-folders-list/statuses-tree/statuses-tree.component";

export const DropFoldersComponentesList = [
  DropFoldersListComponent,
  DropFoldersListTableComponent,
  AdditionalFiltersComponent,
  StatusesFilterComponent,
  StatusesTreeComponent,
  FolderNamePipe,
  FolderFileStatusPipe
];
