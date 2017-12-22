import { KalturaMediaEntryFilterForPlaylist } from 'kaltura-ngx-client/api/types/KalturaMediaEntryFilterForPlaylist';

export interface PlaylistRule {
  selectionId?: string;
  name: string;
  entriesCount: number;
  entriesDuration: number;
  orderBy: string;
  limit: number;
  originalFilter: KalturaMediaEntryFilterForPlaylist
}
