import * as R from 'ramda';

import { EntriesStore } from '../entries-store.service';
import { ValueFilter } from '../value-filter';

export class FlavorsFilter extends ValueFilter<string> {

    static filterType = "Flavors"; // IMPORTANT: you must have a static filterType property that is used at runtime

    constructor(value: string, label: string) {
    super(label, value, { token: 'applications.content.filters.flavor', args: { '0': label } });
  }
}

EntriesStore.registerFilterType(FlavorsFilter, (items, request) => {
  request.filter.flavorParamsIdsMatchOr = R.reduce((acc: string, item: ValueFilter<string>) => {
    return `${acc}${acc ? ',' : ''}${item.value}`;
  }, '', items);
});

