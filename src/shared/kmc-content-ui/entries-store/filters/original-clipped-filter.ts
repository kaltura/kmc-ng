import {FilterItem, FilterRequestContext} from "../filter-item";

import * as R from 'ramda';
import {KalturaNullableBoolean} from '@kaltura-ng2/kaltura-api/types';

type AcceptedValues = '0' | '1';

export class OriginalClippedFilter  extends FilterItem{

    private _value : AcceptedValues;

    public get value() : AcceptedValues{
        return this._value;
    }

    constructor(value : AcceptedValues, label : string)
    {
        super(label);
        this._value = value;

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
