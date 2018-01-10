import { KalturaMediaEntryFilterForPlaylist } from 'kaltura-ngx-client/api/types/KalturaMediaEntryFilterForPlaylist';
import { KalturaPlayableEntryOrderBy } from 'kaltura-ngx-client/api/types/KalturaPlayableEntryOrderBy';

export interface PlaylistRule {
  selectionId?: string;
  name: string;
  entriesCount: number;
  entriesDuration: number;
  orderBy: KalturaPlayableEntryOrderBy;
  limit: number;
  originalFilter: KalturaMediaEntryFilterForPlaylist
}
