import { Route } from '@angular/router';

import { ContentModerationComponent } from './content-moderation.component';
import { EntriesListHolderComponent } from './entries/entries-list-holder.component';

export const routing: Route[] = [
  {
    path: '', component: ContentModerationComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: EntriesListHolderComponent }
    ]
  }
];
