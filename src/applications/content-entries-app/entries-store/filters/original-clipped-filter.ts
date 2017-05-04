import { KalturaNullableBoolean } from 'kaltura-typescript-client/types';

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
                    value  = KalturaNullableBoolean.falseValue;
                }else if (value === KalturaNullableBoolean.trueValue)
                {
                    value  = KalturaNullableBoolean.nullValue;
                }
                break;
            case '1':
                if (value == null)
                {
                    value  = KalturaNullableBoolean.trueValue;
                }else if (value === KalturaNullableBoolean.falseValue)
                {
                    value  = KalturaNullableBoolean.nullValue;
                }
                break;
        }
    });

    request.filter.isRoot = value;
});
