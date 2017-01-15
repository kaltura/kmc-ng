import {FilterRequestContext} from "../filter-item";
import {ValueFilter} from '../value-filter';

export class MediaTypesFilter  extends ValueFilter<string>{

    constructor(value : string, label : string)
    {
        super(value, label);
    }

    _buildRequest(request : FilterRequestContext) : void {

        if (typeof request.filter.mediaTypeIn !== 'undefined')
        {
            request.filter.mediaTypeIn += `,${this.value}`;
        }else
        {
            request.filter.mediaTypeIn = this.value;
        }
    }
}
