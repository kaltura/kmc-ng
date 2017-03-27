import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import * as R from 'ramda';

import { EntriesStore } from "../entries-store.service";
import { ValueFilter } from '../value-filter';

export class MediaTypesFilter  extends ValueFilter<string>{

    constructor(value : string, label : string, appLocalization: AppLocalization)
    {
	    let tooltip =`${appLocalization.get('applications.content.filters.mediaType').replace("%1",label)}`;
        super(value, label, tooltip);
    }
}

EntriesStore.registerFilterType(MediaTypesFilter, (items, request) =>
{
    request.filter.mediaTypeIn = R.reduce((acc : string, item : ValueFilter<string>) =>
    {
        return `${acc}${acc ? ',' : ''}${item.value}`;
    },'',items);
});

