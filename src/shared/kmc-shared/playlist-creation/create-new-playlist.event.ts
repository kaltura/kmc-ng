import { AppEvent } from 'shared/kmc-shared/app-events/app-event';
import { KalturaPlaylistType } from 'kaltura-ngx-client/api/types/KalturaPlaylistType';

export interface CreateNewPlaylistEventArgs {
  name?: string;
  type: KalturaPlaylistType;
  description?: string;
  playlistContent?: string; // entry ids separated by comma
}

export class CreateNewPlaylistEvent extends AppEvent {
  constructor(public data: CreateNewPlaylistEventArgs, public tabName?: 'content' | 'metadata') {
    super('CreateNewPlaylist');
  }
}
