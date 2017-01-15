import {FilterRequestContext} from "../filter-item";
import {ValueFilter} from '../value-filter';

export class FreetextFilter  extends ValueFilter<string>{

    constructor(value : string, label : string = value)
    {
        super(value, label);
    }

    _buildRequest(request : FilterRequestContext) : void {
        request.filter.freeText = this.value;
    }
}
