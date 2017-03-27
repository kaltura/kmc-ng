import { KalturaUtils } from '@kaltura-ng2/kaltura-api';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';

import { EntriesStore } from "../entries-store.service";
import { ValueFilter } from '../value-filter';

export class TimeSchedulingFilter  extends ValueFilter<string>{


    private _scheduledBefore : Date;
    private _scheduledAfter : Date;

    public get scheduledAfter() : Date{
        return this._scheduledAfter;
    }

    public get scheduledBefore() : Date{
        return this._scheduledBefore;
    }

    constructor(value : string, label : string, scheduledTo? : Date, scheduledFrom? : Date, appLocalization: AppLocalization)
    {
	    let tooltip =`${appLocalization.get('applications.content.filters.scheduling').replace("%1",label)}`;
        super(value, label, tooltip);
        this._scheduledAfter = scheduledFrom;
        this._scheduledBefore = scheduledTo;
    }
}

EntriesStore.registerFilterType(TimeSchedulingFilter, (items, request) =>
{

    items.forEach((item : TimeSchedulingFilter) =>
    {
        switch (item.value)
        {
            case 'past':
                if (request.filter.endDateLessThanOrEqual === undefined || request.filter.endDateLessThanOrEqual < KalturaUtils.toServerDate(new Date())) {
                    request.filter.endDateLessThanOrEqual = KalturaUtils.toServerDate(new Date());
                }
                break;
            case 'live':
                if (request.filter.startDateLessThanOrEqualOrNull === undefined || request.filter.startDateLessThanOrEqualOrNull > KalturaUtils.toServerDate(new Date())) {
                    request.filter.startDateLessThanOrEqualOrNull = KalturaUtils.toServerDate(new Date());
                }
                if (request.filter.endDateGreaterThanOrEqualOrNull === undefined || request.filter.endDateGreaterThanOrEqualOrNull < KalturaUtils.toServerDate(new Date())) {
                    request.filter.endDateGreaterThanOrEqualOrNull = KalturaUtils.toServerDate(new Date());
                }
                break;
            case 'future':
                if (request.filter.startDateGreaterThanOrEqual === undefined || request.filter.startDateGreaterThanOrEqual > KalturaUtils.toServerDate(new Date())) {
                    request.filter.startDateGreaterThanOrEqual = KalturaUtils.toServerDate(new Date());
                }
                break;
            case 'scheduled':
                if (item.scheduledAfter) {
                    if (request.filter.startDateGreaterThanOrEqual === undefined || request.filter.startDateGreaterThanOrEqual > KalturaUtils.toServerDate(item.scheduledAfter)) {
                        request.filter.startDateGreaterThanOrEqual = KalturaUtils.toServerDate(item.scheduledAfter);
                    }
                }

                if (item.scheduledBefore) {
                    if (request.filter.endDateLessThanOrEqual === undefined || request.filter.endDateLessThanOrEqual < KalturaUtils.toServerDate(item.scheduledBefore)) {
                        request.filter.endDateLessThanOrEqual = KalturaUtils.toServerDate(item.scheduledBefore);
                    }
                }

                break;
            default:
                break
        }
    });
});
