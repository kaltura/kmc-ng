import { AppEvent } from 'shared/kmc-shared/app-events/app-event';
import { KalturaPlaylistType } from 'kaltura-ngx-client/api/types/KalturaPlaylistType';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';

export interface CreateNewPlaylistEventArgs {
  name?: string;
  type: KalturaPlaylistType;
  description?: string;
  entries?: KalturaMediaEntry[];
  ruleBasedSub?: boolean;
}

export class CreateNewPlaylistEvent extends AppEvent {
  constructor(public data: CreateNewPlaylistEventArgs, public tabName?: 'content' | 'metadata') {
    super('CreateNewPlaylist');
  }
}
