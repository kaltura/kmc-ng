import { Route } from '@angular/router';

import { ContentDocumentsComponent } from './content-documents.component';
import { DocumentsListComponent } from './documents/documents-list/documents-list.component';
import { DocumentMetadataComponent } from "../content-documents-app/document/document-metadata/document-metadata.component";
import { DocumentCanDeactivate } from "./document/document-can-deactivate.service";
import { DocumentComponent } from "./document/document.component";
import { DocumentThumbnails } from './document/document-thumbnails/document-thumbnails.component';
import { DocumentAccessControl } from './document/document-access-control/document-access-control.component';
import { DocumentScheduling } from './document/document-scheduling/document-scheduling.component';
import { DocumentRelated } from './document/document-related/document-related.component';
import { DocumentUsers } from './document/document-users/document-users.component';


export const routing: Route[] = [
  {
    path: '', component: ContentDocumentsComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: DocumentsListComponent },
        {
            path: 'document/:id', canDeactivate: [DocumentCanDeactivate], component: DocumentComponent,
            data: {
                documentRoute: true
            },
            children: [
                { path: '', redirectTo: 'metadata', pathMatch: 'full' },
                { path: 'metadata', component: DocumentMetadataComponent },
                { path: 'thumbnails', component: DocumentThumbnails },
                { path: 'accesscontrol', component: DocumentAccessControl },
                { path: 'scheduling', component: DocumentScheduling },
                { path: 'related', component: DocumentRelated },
                { path: 'users', component: DocumentUsers }
            ]
        }
    ]
  }
];
