

import {FilterItem, FilterRequestContext} from "../filter-item";
import * as moment from 'moment';

export class CreatedAfterFilter  extends FilterItem{

    private toServerDate(value? : Date) : number
{
    return value ? value.getTime() / 1000 : null;
}
    constructor(public date : Date)
    {
        super(`After ${moment(date).format('LL')}`);
    }

    _buildRequest(request : FilterRequestContext) : void {
        request.filter.createdAtGreaterThanOrEqual = this.toServerDate(this.date);
    }
}
