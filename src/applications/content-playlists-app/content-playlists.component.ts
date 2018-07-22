import { Component } from '@angular/core';
import { PlaylistsStore } from './playlists/playlists-store/playlists-store.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { KalturaLoggerName } from '@kaltura-ng/kaltura-logger';

@Component({
    selector: 'kPlaylists',
    templateUrl: './content-playlists.component.html',
    styleUrls: ['./content-playlists.component.scss'],
    providers: [
      PlaylistsStore,
        KalturaLogger,
        {
            provide: KalturaLoggerName, useValue: 'playlists-store.service'
        }
    ]
})
export class ContentPlaylistsComponent  {}

