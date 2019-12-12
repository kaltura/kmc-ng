import { Injectable } from '@angular/core';
import { KalturaPlaylist } from 'kaltura-ngx-client';

@Injectable()
export class PlaylistsUtilsService {

  constructor() {
  }

  public isRapt(playlist: KalturaPlaylist): boolean {
      return playlist.adminTags && playlist.adminTags.split(',').indexOf('raptentry') > -1 ? true : false;
  }
}
