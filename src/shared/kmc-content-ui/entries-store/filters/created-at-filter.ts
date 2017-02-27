import * as moment from 'moment';

import { KalturaUtils } from '@kaltura-ng2/kaltura-api';
import { EntriesStore } from "../entries-store.service";
import { FilterItem } from "../filter-item";

export class CreatedAtFilter  extends FilterItem{

    private _createdBefore : Date;
    private _createdAfter : Date;

    public get createdAfter() : Date{
        return this._createdAfter;
    }

    public get createdBefore() : Date{
        return this._createdBefore;
    }

    constructor(createdAfter? : Date, createdBefore? : Date)
    {
        let tooltip = '';
        if (createdAfter && createdBefore)
        {
            tooltip =`${moment(createdAfter).format('LL')} - ${moment(createdBefore).format('LL')}`;
        }else if (createdAfter)
        {
            tooltip =`After ${moment(createdAfter).format('LL')}`;
        }else if (createdBefore)
        {
            tooltip =`Before ${moment(createdBefore).format('LL')}`;
        }

        super('Dates', tooltip);
        this._createdAfter = createdAfter;
        this._createdBefore = createdBefore;
    }
}

EntriesStore.registerFilterType(CreatedAtFilter, (items, request) =>
{
    const firstItem = items[0];

    if (firstItem.createdBefore) {
        request.filter.createdAtLessThanOrEqual = KalturaUtils.toServerDate(KalturaUtils.getEndDateValue(firstItem.createdBefore));
    }

    if (firstItem.createdAfter) {
        request.filter.createdAtGreaterThanOrEqual = KalturaUtils.toServerDate(KalturaUtils.getStartDateValue(firstItem.createdAfter));
    }
});
