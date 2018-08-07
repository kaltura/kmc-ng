import {Pipe, PipeTransform} from '@angular/core';
import {KalturaPlaylist} from 'kaltura-ngx-client';
import {KalturaPlaylistType} from 'kaltura-ngx-client';

@Pipe({name: 'kToPlaylistIcon'})
export class PlaylistIconPipe implements PipeTransform {
  constructor() {
  }

  transform(playlistId: string, playlistsIdToNameMap: Map<string, KalturaPlaylist>): string {
    if (!playlistId) {
      return '';
    }
    if (!playlistsIdToNameMap) {
      return playlistId;
    }

    const playlist = playlistsIdToNameMap.get(playlistId);
    if (!playlist) {
        return '';
    }

    const playlistType = playlist.playlistType;

    if (typeof(playlistType) !== 'undefined' && playlistType !== null) {
      switch (playlistType) {
        case KalturaPlaylistType.dynamic:
        case KalturaPlaylistType.external:
          return 'kIconPlaylist_RuleBased';
        case KalturaPlaylistType.staticList:
          return 'kIconPlaylist_Manual';
        default:
          return 'kIconUnknown';
      }
    }
  }
}
