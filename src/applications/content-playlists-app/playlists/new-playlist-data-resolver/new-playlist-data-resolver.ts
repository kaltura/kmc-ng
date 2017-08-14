import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { PlaylistsStore } from '../playlists-store/playlists-store.service';

@Injectable()
export class NewPlaylistDataResolver implements Resolve<any> {
  constructor(
    public router: Router,
    private _playlistsStore: PlaylistsStore
  ) {}

  resolve() {
    if(this._playlistsStore.newPlaylistData.name) {
      return this._playlistsStore.newPlaylistData;
    }
    /*if(this._playlistsStore.newPlaylistData.name) {
      return this._playlistsStore.newPlaylistData;
    } else {
      this.router.navigate(['/content/playlists/list']);
    }*/
  }
}
