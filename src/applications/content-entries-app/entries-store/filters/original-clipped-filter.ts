import { KalturaNullableBoolean } from '@kaltura-ng2/kaltura-api/types';

import { EntriesStore } from "../entries-store.service";
import { ValueFilter } from '../value-filter';

type AcceptedValues = '0' | '1';

export class OriginalClippedFilter  extends ValueFilter<AcceptedValues>{

    constructor(value : AcceptedValues, label : string)
    {
        super(value, label);
    }
}

EntriesStore.registerFilterType(OriginalClippedFilter, (items, request) =>
{
    let value : KalturaNullableBoolean = null;

    items.forEach((item :ValueFilter<AcceptedValues>) =>
    {
        switch (item.value)
        {
            case '0':
                if (value == null)
                {
                    value  = KalturaNullableBoolean.FalseValue;
                }else if (value === KalturaNullableBoolean.TrueValue)
                {
                    value  = KalturaNullableBoolean.NullValue;
                }
                break;
            case '1':
                if (value == null)
                {
                    value  = KalturaNullableBoolean.TrueValue;
                }else if (value === KalturaNullableBoolean.FalseValue)
                {
                    value  = KalturaNullableBoolean.NullValue;
                }
                break;
        }
    });

    request.filter.isRoot = value;
});
