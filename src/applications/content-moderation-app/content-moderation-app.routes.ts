import { Route } from '@angular/router';

import { ContentModerationComponent } from './content-moderation.component';
import { EntriesListComponent } from './entries/entries-list.component';

export const routing: Route[] = [
  {
    path: '', component: ContentModerationComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: EntriesListComponent }
    ]
  }
];
