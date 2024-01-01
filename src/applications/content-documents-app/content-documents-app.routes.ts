import { Route } from '@angular/router';

import { ContentDocumentsComponent } from './content-documents.component';
import { DocumentsListComponent } from './documents/documents-list/documents-list.component';
import {DocumentMetadataComponent} from "../content-documents-app/document/document-metadata/document-metadata.component";
import {DocumentCanDeactivate} from "./document/document-can-deactivate.service";
import {DocumentComponent} from "./document/document.component";


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
                { path: 'metadata', component: DocumentMetadataComponent }
            ]
        }
    ]
  }
];
