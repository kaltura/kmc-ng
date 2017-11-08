import { Component } from '@angular/core';
import { PlaylistsStore } from './playlists/playlists-store/playlists-store.service';

@Component({
    selector: 'kPlaylists',
    templateUrl: './content-playlists.component.html',
    styleUrls: ['./content-playlists.component.scss'],
    providers: [PlaylistsStore]
})
export class ContentPlaylistsComponent  {}

