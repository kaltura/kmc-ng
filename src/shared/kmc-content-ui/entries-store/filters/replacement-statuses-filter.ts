

import {FilterItem, FilterRequestContext} from "../filter-item";
export class ReplacementStatusesFilter  extends FilterItem{

    private _value : string;

    public get value() : string{
        return this._value;
    }

    constructor(value : string, label : string)
    {
        super(label);
        this._value = value;
    }

    _buildRequest(request : FilterRequestContext) : void {

        if (typeof request.filter.replacementStatusIn !== 'undefined')
        {
            request.filter.replacementStatusIn += `,${this.value}`;
        }else
        {
            request.filter.replacementStatusIn = this.value;
        }
    }
}
