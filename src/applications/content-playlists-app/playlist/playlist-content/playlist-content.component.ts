import { Component } from '@angular/core';
import { PlaylistStore } from '../playlist-store.service';
import { KalturaPlaylistType } from 'kaltura-ngx-client';

@Component({
  selector: 'kPlaylistContent',
  templateUrl: './playlist-content.component.html'
})
export class PlaylistContentComponent {
  public _playlistTypes = KalturaPlaylistType;
  constructor(public _playlistStore: PlaylistStore) {
  }
}
