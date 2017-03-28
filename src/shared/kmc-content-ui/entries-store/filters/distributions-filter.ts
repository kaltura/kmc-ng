import {
    KalturaSearchOperator,
    KalturaContentDistributionSearchItem
} from '@kaltura-ng2/kaltura-api/types'
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { KalturaSearchOperatorType } from '@kaltura-ng2/kaltura-api/kaltura-enums'

import { EntriesStore } from "../entries-store.service";
import { ValueFilter } from '../value-filter';

export class DistributionsFilter  extends ValueFilter<number>{

    constructor(value : number, label : string, appLocalization: AppLocalization)
    {
	    let tooltip =`${appLocalization.get('applications.content.filters.distribution').replace("%1",label)}`;
	    super(value, label, tooltip);
    }
}

EntriesStore.registerFilterType(DistributionsFilter, (items, request) =>
{
    const distributionItem = new KalturaSearchOperator();
    distributionItem.type = KalturaSearchOperatorType.SearchOr;
    request.advancedSearch.items.push(distributionItem);

    items.forEach(item =>
    {
        const newItem = new KalturaContentDistributionSearchItem();
        newItem.distributionProfileId = item.value;
        newItem.hasEntryDistributionValidationErrors = false;
        newItem.noDistributionProfiles = false;
        distributionItem.items.push(newItem)
    });
});
