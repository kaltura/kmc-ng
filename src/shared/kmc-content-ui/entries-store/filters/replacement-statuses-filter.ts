import {FilterRequestContext} from "../filter-item";
import {ValueFilter} from '../value-filter';

export class ReplacementStatusesFilter  extends ValueFilter<string>{

    constructor(value : string, label : string)
    {
        super(value, label);
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
