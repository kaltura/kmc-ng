
import {FilterRequestContext} from "../filter-item";
import {ValueFilter} from '../value-filter';

export class FlavorsFilter  extends ValueFilter<string>{

    constructor(value : string, label : string)
    {
        super(value, label);
    }

    _buildRequest(request : FilterRequestContext) : void {
        if (typeof request.filter.flavorParamsIdsMatchOr !== 'undefined')
        {
            request.filter.flavorParamsIdsMatchOr += `,${this.value}`;
        }else
        {
            request.filter.flavorParamsIdsMatchOr = this.value;
        }
    }
}
