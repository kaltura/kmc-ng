import {Route} from '@angular/router';
import {ContentSyndicationComponent} from './content-syndication.component';
import {FeedsListComponent} from './feeds/feeds-list/feeds-list.component';

export const routing: Route[] = [
  {
    path: '', component: ContentSyndicationComponent,
    children: [
      {path: '', redirectTo: 'list', pathMatch: 'full'},
      {path: 'list', component: FeedsListComponent},
    ]
  }
];
