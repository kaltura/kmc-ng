import { KalturaMediaEntryFilterForPlaylist } from 'kaltura-ngx-client';
import { KalturaPlayableEntryOrderBy } from 'kaltura-ngx-client';

export interface PlaylistRule {
  selectionId?: string;
  name: string;
  entriesCount: number;
  entriesDuration: number;
  orderBy: KalturaPlayableEntryOrderBy;
  limit: number;
  originalFilter: KalturaMediaEntryFilterForPlaylist
}
