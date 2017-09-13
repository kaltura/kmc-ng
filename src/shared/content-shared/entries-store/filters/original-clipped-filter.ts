import { KalturaNullableBoolean } from 'kaltura-typescript-client/types/KalturaNullableBoolean';

import { EntriesStore } from '../entries-store.service';
import { ValueFilter } from '../value-filter';

type AcceptedValues = '0' | '1';

export class OriginalClippedFilter extends ValueFilter<AcceptedValues> {

    static filterType = "OriginalClipped"; // IMPORTANT: you must have a static filterType property that is used at runtime

  constructor(value: AcceptedValues, label: string) {
    super(label, value, { token: 'applications.content.filters.originalClipped', args: { '0': label } });
  }
}

EntriesStore.registerFilterType(OriginalClippedFilter, (items, request) => {
  let value: KalturaNullableBoolean = null;

  items.forEach((item: ValueFilter<AcceptedValues>) => {
    switch (item.value) {
      case '0':
        if (value == null) {
          value = KalturaNullableBoolean.falseValue;
        } else if (value === KalturaNullableBoolean.trueValue) {
          value = KalturaNullableBoolean.nullValue;
        }
        break;
      case '1':
        if (value == null) {
          value = KalturaNullableBoolean.trueValue;
        } else if (value === KalturaNullableBoolean.falseValue) {
          value = KalturaNullableBoolean.nullValue;
        }
        break;
    }
  });

  request.filter.isRoot = value;
});
