import {FilterRequestContext} from "../filter-item";
import {ValueFilter} from '../value-filter';

export class ModerationStatusesFilter  extends ValueFilter<string>{

    constructor(value : string, label : string)
    {
        super(value, label);
    }

    _buildRequest(request : FilterRequestContext) : void {

        if (typeof request.filter.moderationStatusIn !== 'undefined')
        {
            request.filter.moderationStatusIn += `,${this.value}`;
        }else
        {
            request.filter.moderationStatusIn = this.value;
        }
    }
}
