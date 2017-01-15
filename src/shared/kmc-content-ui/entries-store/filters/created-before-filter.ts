import * as moment from 'moment';
import {FilterRequestContext} from "../filter-item";
import {ValueFilter} from '../value-filter';

export class CreatedBeforeFilter  extends ValueFilter<Date>{

    constructor(value : Date)
    {
        super(value, `Before ${moment(value).format('LL')}`);
    }


    private toServerDate(value?: Date): number {
        return value ? value.getTime() / 1000 : null;
    }

    _buildRequest(request : FilterRequestContext) : void {
        request.filter.createdAtLessThanOrEqual = this.toServerDate(this.value);
    }
}
