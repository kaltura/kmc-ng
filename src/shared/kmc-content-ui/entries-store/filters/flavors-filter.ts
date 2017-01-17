import * as R from 'ramda';

import {EntriesStore} from "../entries-store.service";
import {ValueFilter} from '../value-filter';

export class FlavorsFilter  extends ValueFilter<string>{

    constructor(value : string, label : string)
    {
        super(value, label);
    }
}

EntriesStore.registerFilterType(FlavorsFilter, (items, request) =>
{
    request.filter.flavorParamsIdsMatchOr = R.reduce((acc : string, item : ValueFilter<string>) =>
    {
        return `${acc}${acc ? ',' : ''}${item.value}`;
    },'',items);
});

