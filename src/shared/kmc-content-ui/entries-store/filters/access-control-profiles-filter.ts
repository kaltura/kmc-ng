

import {FilterRequestContext} from "../filter-item";
import {ValueFilter} from '../value-filter';

export class AccessControlProfilesFilter  extends ValueFilter<string>{

    constructor(value : string, label : string)
    {
        super(value, label);
    }

    _buildRequest(request : FilterRequestContext) : void {

        if (typeof request.filter.accessControlIdIn !== 'undefined')
        {
            request.filter.accessControlIdIn += `,${this.value}`;
        }else
        {
            request.filter.accessControlIdIn = this.value;
        }
    }
}
