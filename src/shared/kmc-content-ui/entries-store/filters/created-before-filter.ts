

import {FilterItem, FilterRequestContext} from "../filter-item";
import * as moment from 'moment';

export class CreatedBeforeFilter  extends FilterItem{

    private _date : Date;

    public get date() : Date{
        return this._date;
    }

    constructor(date: Date) {
        super(`Before ${moment(date).format('LL')}`);
        this._date = date;

    }

    private toServerDate(value?: Date): number {
        return value ? value.getTime() / 1000 : null;
    }

    _buildRequest(request : FilterRequestContext) : void {
        request.filter.createdAtLessThanOrEqual = this.toServerDate(this.date);
    }
}
