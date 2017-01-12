

import {FilterItem, FilterRequestContext} from "../filter-item";
export class FlavorsFilter  extends FilterItem{


    private _flavor : string;

    public get flavor() : string{
        return this._flavor;
    }

    constructor(flavor : string, label : string)
    {
        super(label);
        this._flavor = flavor;
    }

    _buildRequest(request : FilterRequestContext) : void {
        if (typeof request.filter.flavorParamsIdsMatchOr !== 'undefined')
        {
            request.filter.flavorParamsIdsMatchOr += `,${this.flavor}`;
        }else
        {
            request.filter.flavorParamsIdsMatchOr = this.flavor;
        }
    }
}
