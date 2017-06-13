import { PlaylistsStore } from "../playlists-store.service";
import { ValueFilter } from './value-filter';

export class FreetextFilter  extends ValueFilter<string>{

    constructor(value : string)
    {
        super(value+'', value, {token: 'applications.content.filters.freeText'});
    }
}

PlaylistsStore.registerFilterType(FreetextFilter, (items, request) =>
{
    const firstItem = items[0];
    request.filter.freeText = firstItem.value;
});
