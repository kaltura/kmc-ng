import { Route } from '@angular/router';

import { ContentRoomsComponent } from './content-rooms.component';
import { RoomsListComponent } from './rooms/rooms-list/rooms-list.component';
import { RoomComponent } from './room/room.component';
import { RoomMetadataComponent } from './room/room-metadata/room-metadata.component';
import { RoomCanDeactivate } from './room/room-can-deactivate.service';

export const routing: Route[] = [
  {
    path: '', component: ContentRoomsComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: RoomsListComponent },
      {
        path: 'room/:id', canDeactivate: [RoomCanDeactivate], component: RoomComponent,
        data: {
          roomRoute: true
        },
        children: [
          { path: '', redirectTo: 'metadata', pathMatch: 'full' },
          { path: 'metadata', component: RoomMetadataComponent }
        ]
      }
    ]
  }
];