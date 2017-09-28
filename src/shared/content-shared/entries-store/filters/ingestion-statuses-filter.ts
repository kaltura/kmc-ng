import * as R from 'ramda';

import { EntriesStore } from '../entries-store.service';
import { ValueFilter } from '../value-filter';

export class IngestionStatusesFilter extends ValueFilter<string> {

    static filterType = "IngestionStatuses"; // IMPORTANT: you must have a static filterType property that is used at runtime

    constructor(value: string, label: string) {
    super(label, value, { token: 'applications.content.filters.status', args: { '0': label } });
  }
}

EntriesStore.registerFilterType(IngestionStatusesFilter, (items, request) => {
  request.filter.statusIn = R.reduce((acc: string, item: ValueFilter<string>) => {
    return `${acc}${acc ? ',' : ''}${item.value}`;
  }, '', items);
});
