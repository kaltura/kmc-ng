import { Route } from '@angular/router';

import { ContentRoomsComponent } from './content-rooms.component';
import { RoomsListComponent } from './rooms/rooms-list/rooms-list.component';
import { RoomComponent } from './room/room.component';
import { RoomMetadataComponent } from './room/room-metadata/room-metadata.component';
import { RoomCanDeactivate } from './room/room-can-deactivate.service';
import { RoomThumbnails } from "./room/room-thumbnails/room-thumbnails.component";
import { RoomAccessControl } from "./room/room-access-control/room-access-control.component";
import { RoomUsers } from "./room/room-users/room-users.component";
import { RoomBreakout } from "./room/room-breakout/room-breakout.component";

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
          { path: 'metadata', component: RoomMetadataComponent },
          { path: 'thumbnails', component: RoomThumbnails },
          { path: 'accesscontrol', component: RoomAccessControl },
          { path: 'breakout', component: RoomBreakout },
          { path: 'users', component: RoomUsers }
        ]
      }
    ]
  }
];
