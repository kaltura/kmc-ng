import { DropFoldersListComponent } from './drop-folders-list/drop-folders-list.component';
import { DropFoldersTableComponent } from './drop-folders-table/drop-folders-table.component';
import { FolderFileStatusPipe } from './pipes/folder-file-status.pipe';
import { DropFoldersTagsComponent } from './drop-folders-tags/drop-folders-tags.component';
import { DropFoldersRefineFiltersComponent } from './drop-folders-refine-filters/drop-folders-refine-filters.component';

export const DropFoldersComponentsList = [
  DropFoldersListComponent,
  DropFoldersTableComponent,
  DropFoldersTagsComponent,
  DropFoldersRefineFiltersComponent,
  FolderFileStatusPipe
];
