import { Component } from '@angular/core';
import { PlaylistsStore } from './playlists/playlists-store/playlists-store.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
    selector: 'kPlaylists',
    templateUrl: './content-playlists.component.html',
    styleUrls: ['./content-playlists.component.scss'],
    providers: [
      PlaylistsStore,
      KalturaLogger.createFactory('playlists-store.service')
    ]
})
export class ContentPlaylistsComponent  {}

