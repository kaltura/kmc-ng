import {FilterRequestContext} from "../filter-item";
import {ValueFilter} from '../value-filter';

export class IngestionStatusesFilter  extends ValueFilter<string>{

    constructor(value : string, label : string)
    {
        super(value, label);
    }

    _buildRequest(request : FilterRequestContext) : void {
        if (typeof request.filter.statusIn !== 'undefined')
        {
            request.filter.statusIn += `,${this.value}`;
        }else
        {
            request.filter.statusIn = this.value;
        }
    }
}
