import {Route} from '@angular/router';
import {ContentEntriesComponent} from './content-entries.component';
import {EntriesListHolderComponent} from './entries/entries-list-holder.component';
import {EntryComponent} from './entry/entry.component';
import {EntryMetadata} from './entry/entry-metadata/entry-metadata.component';
import {EntryUsers} from './entry/entry-users/entry-users.component';
import {EntryClips} from './entry/entry-clips/entry-clips.component';
import {EntryRelated} from './entry/entry-related/entry-related.component';
import {EntryLive} from './entry/entry-live/entry-live.component';
import {EntryCaptions} from './entry/entry-captions/entry-captions.component';
import {EntryFlavours} from './entry/entry-flavours/entry-flavours.component';
import {EntryScheduling} from './entry/entry-scheduling/entry-scheduling.component';
import {EntryAccessControl} from './entry/entry-access-control/entry-access-control.component';
import {EntryThumbnails} from './entry/entry-thumbnails/entry-thumbnails.component';
import {EntryCanDeactivate} from './entry/entry-can-deactivate.service';
import {EntryDistributionComponent} from './entry/entry-distribution/entry-distribution.component';
import {EntryAdvertisementsComponent} from './entry/entry-advertisements/entry-advertisements.component';
import {EntryFlavoursChildren} from './entry/entry-flavours-children/entry-flavours-children.component';

export const routing: Route[] = [
  {
    path: '', component: ContentEntriesComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: EntriesListHolderComponent },
      {
        path: 'entry/:id', canDeactivate: [EntryCanDeactivate], component: EntryComponent,
        data: {
          entryRoute: true
        },
        children: [
          { path: '', redirectTo: 'metadata', pathMatch: 'full' },
          { path: 'metadata', component: EntryMetadata },
          { path: 'thumbnails', component: EntryThumbnails },
          { path: 'accesscontrol', component: EntryAccessControl },
          { path: 'scheduling', component: EntryScheduling },
          { path: 'flavours', component: EntryFlavours },
          { path: 'flavourschildren', component: EntryFlavoursChildren },
          { path: 'captions', component: EntryCaptions },
          { path: 'live', component: EntryLive },
          { path: 'related', component: EntryRelated },
          { path: 'clips', component: EntryClips },
          { path: 'advertisements', component: EntryAdvertisementsComponent },
          { path: 'users', component: EntryUsers },
          { path: 'distribution', component: EntryDistributionComponent },
        ]
      }
    ]
  }
];
