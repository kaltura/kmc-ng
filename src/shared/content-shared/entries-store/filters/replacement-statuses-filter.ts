import * as R from 'ramda';

import { EntriesStore } from '../entries-store.service';
import { ValueFilter } from '../value-filter';

export class ReplacementStatusesFilter extends ValueFilter<string> {

    static filterType = "ReplacementStatuses"; // IMPORTANT: you must have a static filterType property that is used at runtime


  constructor(value: string, label: string) {
    super(label, value, { token: 'applications.content.filters.replacementStatuses', args: { '0': label } });
  }
}

EntriesStore.registerFilterType(ReplacementStatusesFilter, (items, request) => {
  request.filter.replacementStatusIn = R.reduce((acc: string, item: ValueFilter<string>) => {
    return `${acc}${acc ? ',' : ''}${item.value}`;
  }, '', items);
});
