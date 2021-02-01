import {Injectable} from '@angular/core';
import { KalturaPlaylist, KalturaPlaylistType } from 'kaltura-ngx-client';

@Injectable()
export class PlaylistsUtilsService {

  constructor() {
  }

  public isRapt(playlist: KalturaPlaylist): boolean {
      return playlist.adminTags && playlist.adminTags.split(',').indexOf('raptentry') > -1 ? true : false;
  }
  public isPath(playlist: KalturaPlaylist): boolean {
      return playlist.playlistType === KalturaPlaylistType.path;
  }
  public isManual(playlist: KalturaPlaylist): boolean {
      return playlist.playlistType === KalturaPlaylistType.staticList;
  }
  public isRuleBased(playlist: KalturaPlaylist): boolean {
      return playlist.playlistType === KalturaPlaylistType.dynamic;
  }
}
