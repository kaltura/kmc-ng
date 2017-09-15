import * as R from 'ramda';

import { BulkLogStoreService } from '../bulk-log-store.service';
import { ValueFilter } from 'app-shared/content-shared/entries-store/value-filter';

export class UploadedItemFilter extends ValueFilter<string> {

  static filterType = 'UploadedItem'; // IMPORTANT: you must have a static filterType property that is used at runtime

  constructor(value: string, label: string) {
    super(label, value, { token: 'applications.content.filters.uploadedItem', args: { '0': label } });
  }
}

BulkLogStoreService.registerFilterType(UploadedItemFilter, (items, request) => {
  request.filter.bulkUploadObjectTypeIn = R.reduce((acc: string, item: ValueFilter<string>) => {
    return `${acc}${acc ? ',' : ''}${item.value}`;
  }, '', items);
});

