import { Route } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ContentEntriesComponent } from './content-entries.component';
import { EntriesListHolderComponent } from './entries/entries-list-holder.component';
import { EntryComponent } from './entry/entry.component';
import { EntryMetadata } from './entry/entry-metadata/entry-metadata.component';
import { EntryUsers } from './entry/entry-users/entry-users.component';
import { EntryWidgetKeys } from './entry/entry-widget-keys';
import { EntryClips } from './entry/entry-clips/entry-clips.component';
import { EntryRelated } from './entry/entry-related/entry-related.component';
import { EntryLive } from './entry/entry-live/entry-live.component';
import { EntryCaptions } from './entry/entry-captions/entry-captions.component';
import { EntryFlavours } from './entry/entry-flavours/entry-flavours.component';
import { EntryScheduling } from './entry/entry-scheduling/entry-scheduling.component';
import { EntryAccessControl } from './entry/entry-access-control/entry-access-control.component';
import { EntryThumbnails } from './entry/entry-thumbnails/entry-thumbnails.component';
import { EntryCanDeactivate } from './entry/entry-can-deactivate.service';

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
          { path: 'metadata', component: EntryMetadata, data: { sectionKey: EntryWidgetKeys.Metadata } },
          { path: 'thumbnails', component: EntryThumbnails, data: { sectionKey: EntryWidgetKeys.Thumbnails } },
          { path: 'accesscontrol', component: EntryAccessControl, data: { sectionKey: EntryWidgetKeys.AccessControl } },
          { path: 'scheduling', component: EntryScheduling, data: { sectionKey: EntryWidgetKeys.Scheduling } },
          { path: 'flavours', component: EntryFlavours, data: { sectionKey: EntryWidgetKeys.Flavours } },
          { path: 'captions', component: EntryCaptions, data: { sectionKey: EntryWidgetKeys.Captions } },
          { path: 'live', component: EntryLive, data: { sectionKey: EntryWidgetKeys.Live } },
          { path: 'related', component: EntryRelated, data: { sectionKey: EntryWidgetKeys.Related } },
          { path: 'clips', component: EntryClips, data: { sectionKey: EntryWidgetKeys.Clips } },
          { path: 'users', component: EntryUsers, data: { sectionKey: EntryWidgetKeys.Users } }
        ]
      }
    ]
  }
];
