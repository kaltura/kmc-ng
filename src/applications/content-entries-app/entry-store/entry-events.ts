import { KalturaBaseEntry } from '@kaltura-ng2/kaltura-api/types';

export class EntryLoading
{
    entryId : string;
}

export class EntryLoaded
{
    entry : KalturaBaseEntry
}