

import {FilterItem, FilterRequestContext} from "../filter-item";
export class DurationsFilters  extends FilterItem{


    private _types : string;

    public get types() : string{
        return this._types;
    }

    constructor(types : string, label : string)
    {
        super(label);
        this._types = types;

    }

    _buildRequest(request : FilterRequestContext) : void {
        if (typeof request.filter.durationTypeMatchOr !== 'undefined')
        {
            request.filter.durationTypeMatchOr += `,${this.types}`;
        }else
        {
            request.filter.durationTypeMatchOr = this.types;
        }
    }
}
