import { Route } from '@angular/router';

import { ContentDropFoldersComponent } from './content-drop-folders.component';
import { DropFoldersListComponent } from './drop-folders-list/drop-folders-list.component';

export const routing: Route[] = [
  {
    path: '', component: ContentDropFoldersComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: DropFoldersListComponent }
    ]
  }
];
