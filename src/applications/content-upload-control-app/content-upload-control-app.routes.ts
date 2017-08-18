import { Route } from '@angular/router';

import { ContentUploadControlComponent } from './content-upload-control.component';
import { UploadListComponent } from './upload-list/upload-list.component';

export const routing: Route[] = [
  {
    path: '', component: ContentUploadControlComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: UploadListComponent }
    ]
  }
];
