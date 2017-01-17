import * as R from 'ramda';

import {EntriesStore} from "../entries-store.service";
import {ValueFilter} from '../value-filter';
export class TimeSchedulingFilter  extends ValueFilter<string>{


    private _scheduledBefore : Date;
    private _scheduledAfter : Date;

    public get scheduledAfter() : Date{
        return this._scheduledAfter;
    }

    public get scheduledBefore() : Date{
        return this._scheduledBefore;
    }

    constructor(value : string, label : string, scheduledTo? : Date, scheduledFrom? : Date)
    {
        super(value, label);
        this._scheduledAfter = scheduledFrom;
        this._scheduledBefore = scheduledTo;
    }

    private toServerDate(value?: Date): number {
        return value ? value.getTime() / 1000 : null;
    }
}

EntriesStore.registerFilterType(TimeSchedulingFilter, (items, request) =>
{

    items.forEach((item : ValueFilter<string>) =>
    {
        switch (item.value)
        {
            case 'past':
                request.filter.endDateLessThanOrEqual = this.toServerDate(new Date());
                break;
            case 'live':
                request.filter.startDateLessThanOrEqualOrNull = this.toServerDate(new Date());
                request.filter.endDateGreaterThanOrEqualOrNull = this.toServerDate(new Date());
                break;
            case 'future':
                request.filter.startDateGreaterThanOrEqual = this.toServerDate(new Date());
                break;
            case 'scheduled':
                request.filter.startDateGreaterThanOrEqual = this.toServerDate(this.scheduledAfter);
                request.filter.endDateLessThanOrEqual = this.toServerDate(this.scheduledBefore);
                break;
            default:
                break
        }
    });
});
