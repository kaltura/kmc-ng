import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { EntriesStore } from "../entries-store.service";
import { ValueFilter } from '../value-filter';

export class FreetextFilter  extends ValueFilter<string>{

    constructor(value : string, label : string = value, appLocalization: AppLocalization)
    {
        super(value, label, appLocalization.get('applications.content.filters.freeText'));
    }
}

EntriesStore.registerFilterType(FreetextFilter, (items, request) =>
{
    const firstItem = items[0];
    request.filter.freeText = firstItem.value;
});
