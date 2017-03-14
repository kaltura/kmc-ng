import { KalturaBaseEntry } from '@kaltura-ng2/kaltura-api/types';
import { KalturaMultiRequest } from '@kaltura-ng2/kaltura-api';
import { EntrySectionTypes } from './entry-sections-types';
import { KalturaMediaEntry } from '@kaltura-ng2/kaltura-api/types';


export class EntryLoading {
    constructor(public entryId: string,
                public request: KalturaMultiRequest,
                public activeSection: EntrySectionTypes) {

    }
}

export class EntryLoadingFailed
{
    constructor(public errorMessage : string)
    {}
}

export class EntryLoaded {
    constructor(
                public entry : KalturaMediaEntry,
                public activeSection: EntrySectionTypes
                )
    {
    }
}

export class SectionLeaving
{
    constructor(public from?: EntrySectionTypes,
                public to?: EntrySectionTypes)
    {
    }

}

export class SectionEntered
{
    constructor(public from?: EntrySectionTypes,
                public to?: EntrySectionTypes)
    {
    }
}

export class EntrySaved
{
    constructor()
    {
    }
}

export class EntrySaving
{
    constructor()
    {
    }
}

export class EntrySavingFailure
{
    constructor(private error : Error)
    {
    }
}


export type EntryEvents = EntryLoadingFailed | EntryLoading | EntryLoaded | SectionLeaving | SectionEntered;