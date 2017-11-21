import { DropFoldersListComponent } from './drop-folders-list.component';
import { DropFoldersListTableComponent } from './drop-folders-list-table.component';
import { FolderFileStatusPipe } from './pipes/folder-file-status.pipe';
import { StatusesFilterComponent } from './statuses-filter/statuses-filter.component';

export const DropFoldersComponentesList = [
  DropFoldersListComponent,
  DropFoldersListTableComponent,
  StatusesFilterComponent,
  FolderFileStatusPipe
];
