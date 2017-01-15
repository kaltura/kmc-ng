
import {KalturaNullableBoolean} from '@kaltura-ng2/kaltura-api/types';

type AcceptedValues = '0' | '1';

import {FilterRequestContext} from "../filter-item";
import {ValueFilter} from '../value-filter';

export class OriginalClippedFilter  extends ValueFilter<AcceptedValues>{

    constructor(value : AcceptedValues, label : string)
    {
        super(value, label);
    }

    _buildRequest(request : FilterRequestContext) : void {

        if (typeof request.filter.isRoot !== 'undefined')
        {
            switch (this.value)
            {
                case '0':
                    // if it is not False then is should be null
                    if (request.filter.isRoot !== KalturaNullableBoolean.FalseValue)
                    {
                        request.filter.isRoot = KalturaNullableBoolean.NullValue;
                    }
                    break;
                case '1':
                    // if it is not True then is should be null
                    if (request.filter.isRoot !== KalturaNullableBoolean.TrueValue)
                    {
                        request.filter.isRoot = KalturaNullableBoolean.NullValue;
                    }
                    break;
            }
        }else
        {
            request.filter.isRoot = this.value === '0' ?  KalturaNullableBoolean.FalseValue : KalturaNullableBoolean.TrueValue;
        }
    }
}
