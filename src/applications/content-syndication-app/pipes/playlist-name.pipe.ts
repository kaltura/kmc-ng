import {Pipe, PipeTransform} from '@angular/core';
import {KalturaPlaylist} from 'kaltura-ngx-client/api/types/KalturaPlaylist';
import {AppLocalization} from '@kaltura-ng/mc-shared/localization';

@Pipe({name: 'kToPlaylistName'})
export class PlaylistNamePipe implements PipeTransform {
  constructor(private _appLocalization: AppLocalization) {
  }

  transform(playlistId: string, playlistsIdToObjectMap: Map<string, KalturaPlaylist>): string {
    if (!playlistId) {
      return this._appLocalization.get('applications.content.syndication.table.allContent');
    }
    if (!playlistsIdToObjectMap) {
      return playlistId;
    }

    const playlist = playlistsIdToObjectMap.get(playlistId);
    return (playlist && playlist.name) || playlistId;
  }
}
