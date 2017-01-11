

import {FilterItem, FilterRequestContext} from "../filter-item";
export class FlavorsFilter  extends FilterItem{


    constructor(public flavor : string, label : string)
    {
        super(label);

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
