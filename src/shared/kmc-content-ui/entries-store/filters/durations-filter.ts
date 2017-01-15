
import {FilterRequestContext} from "../filter-item";
import {ValueFilter} from '../value-filter';

export class DurationsFilters  extends ValueFilter<string>{

    constructor(value : string, label : string)
    {
        super(value, label);
    }

    _buildRequest(request : FilterRequestContext) : void {
        if (typeof request.filter.durationTypeMatchOr !== 'undefined')
        {
            request.filter.durationTypeMatchOr += `,${this.value}`;
        }else
        {
            request.filter.durationTypeMatchOr = this.value;
        }
    }
}
