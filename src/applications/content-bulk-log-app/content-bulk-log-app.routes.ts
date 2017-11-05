import { Route } from '@angular/router';

import { ContentBulkLogAppComponent } from './content-bulk-log-app.component';
import { BulkLogListComponent } from './bulk-log-list/bulk-log-list.component';

export const routing: Route[] = [
  {
    path: '', component: ContentBulkLogAppComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: BulkLogListComponent }
    ]
  }
];
