import { Route } from '@angular/router';

import { ContentDocumentsComponent } from './content-documents.component';
import { DocumentsListComponent } from './documents/documents-list/documents-list.component';

export const routing: Route[] = [
  {
    path: '', component: ContentDocumentsComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: DocumentsListComponent }
    ]
  }
];
