import * as R from 'ramda';

import { EntriesStore } from "../entries-store.service";
import { ValueFilter } from '../value-filter';

export class DurationsFilters  extends ValueFilter<string>{

    constructor(value : string, label : string)
    {
        super(value, label, {token: 'applications.content.filters.duration', args: {'0': label}});
    }
}


EntriesStore.registerFilterType(DurationsFilters, (items, request) =>
{
    request.filter.durationTypeMatchOr = R.reduce((acc : string, item : ValueFilter<string>) =>
    {
        return `${acc}${acc ? ',' : ''}${item.value}`;
    },'',items);
});

