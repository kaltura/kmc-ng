import * as R from 'ramda';

import { EntriesStore } from '../entries-store.service';
import { ValueFilter } from '../value-filter';

export class MediaTypesFilter extends ValueFilter<string> {

    static filterType = "MediaTypes"; // IMPORTANT: you must have a static filterType property that is used at runtime


    constructor(value: string, label: string) {
    super(label, value, { token: 'applications.content.filters.mediaType', args: { '0': label } });
  }
}

EntriesStore.registerFilterType(MediaTypesFilter, (items, request) => {
  request.filter.mediaTypeIn = R.reduce((acc: string, item: ValueFilter<string>) => {
    return `${acc}${acc ? ',' : ''}${item.value}`;
  }, '', items);
});

