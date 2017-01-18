import * as R from 'ramda';

import {EntriesStore} from "../entries-store.service";
import {ValueFilter} from '../value-filter';

function toServerDate(value?: Date): number {
    return value ? value.getTime() / 1000 : null;
}

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
}

EntriesStore.registerFilterType(TimeSchedulingFilter, (items, request) =>
{

    items.forEach((item : ValueFilter<string>) =>
    {
        switch (item.value)
        {
            case 'past':
                request.filter.endDateLessThanOrEqual = toServerDate(new Date());
                break;
            case 'live':
                request.filter.startDateLessThanOrEqualOrNull = toServerDate(new Date());
                request.filter.endDateGreaterThanOrEqualOrNull = toServerDate(new Date());
                break;
            case 'future':
                request.filter.startDateGreaterThanOrEqual = toServerDate(new Date());
                break;
            case 'scheduled':
                request.filter.startDateGreaterThanOrEqual = toServerDate(this.scheduledAfter);
                request.filter.endDateLessThanOrEqual = toServerDate(this.scheduledBefore);
                break;
            default:
                break
        }
    });
});
