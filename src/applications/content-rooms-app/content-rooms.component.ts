import { Component } from '@angular/core';
import { RoomsStore } from './rooms/rooms-store/rooms-store.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { KalturaLoggerName } from '@kaltura-ng/kaltura-logger';

@Component({
    selector: 'kRooms',
    templateUrl: './content-rooms.component.html',
    styleUrls: ['./content-rooms.component.scss'],
    providers: [
        RoomsStore,
        KalturaLogger,
        {
            provide: KalturaLoggerName, useValue: 'playlists-store.service'
        }
    ]
})
export class ContentRoomsComponent {}

