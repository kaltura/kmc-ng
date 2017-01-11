

import {FilterItem, FilterRequestContext} from "../filter-item";
import * as moment from 'moment';

export class CreatedBeforeFilter  extends FilterItem{

    private toServerDate(value? : Date) : number
{
    return value ? value.getTime() / 1000 : null;
}
    constructor(public date : Date)
    {
        super(`Before ${moment(date).format('LL')}`);
    }

    _buildRequest(request : FilterRequestContext) : void {
        request.filter.createdAtLessThanOrEqual = this.toServerDate(this.date);
    }
}
