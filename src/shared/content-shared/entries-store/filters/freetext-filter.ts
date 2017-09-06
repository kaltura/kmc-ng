import { EntriesStore } from '../entries-store.service';
import { ValueFilter } from '../value-filter';

export class FreetextFilterOld extends ValueFilter<string> {

  constructor(value: string) {
    super(value + '', value, { token: 'applications.content.filters.freeText' });
  }
}

// EntriesStore.registerFilterType(FreetextFilter, (items, request) => {
//   const firstItem = items[0];
//   request.filter.freeText = firstItem.value;
// });
