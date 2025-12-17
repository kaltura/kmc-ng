import { AppEvent } from 'shared/kmc-shared/app-events/app-event';
import { KalturaEntryApplication, KalturaPlaylistType } from 'kaltura-ngx-client';
import { ContentPlaylistViewSections } from 'app-shared/kmc-shared/kmc-views/details-views';

export interface CreateNewPlaylistEventArgs {
  name?: string;
  type: KalturaPlaylistType;
  description?: string;
  playlistContent?: string; // entry ids separated by comma
  application: KalturaEntryApplication
}

export class CreateNewPlaylistEvent extends AppEvent {
  constructor(public data: CreateNewPlaylistEventArgs, public section?: ContentPlaylistViewSections) {
    super('CreateNewPlaylist');
  }
}
