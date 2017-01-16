import {EntriesStore} from "../entries-store.service";
import {ValueFilter} from '../value-filter';

export class FreetextFilter  extends ValueFilter<string>{

    constructor(value : string, label : string = value)
    {
        super(value, label);
    }
}

EntriesStore.registerFilterType(FreetextFilter, (items, request) =>
{
    const firstItem = items[0];
    request.filter.freeText = firstItem.value;
});
