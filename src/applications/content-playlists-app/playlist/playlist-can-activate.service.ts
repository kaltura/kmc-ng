import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { PlaylistsStore } from '../playlists/playlists-store/playlists-store.service';

@Injectable()
export class PlaylistCanActivate implements CanActivate {
  constructor(private _playlistsStore: PlaylistsStore, private _router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (route.params['id'] === 'new' && !this._playlistsStore.getNewPlaylistData()) {
      this._router.navigate(['content/playlists']);
      return false;
    }

    return true;
  }
}
