import {
    KalturaSearchOperator,
    KalturaContentDistributionSearchItem
} from 'kaltura-typescript-client/types/all'

import { KalturaSearchOperatorType } from 'kaltura-typescript-client/types/all'

import { EntriesStore } from "../entries-store.service";
import { ValueFilter } from '../value-filter';

export class DistributionsFilter  extends ValueFilter<number>{

    constructor(value : number, label : string)
    {
        super(value, label, {token: 'applications.content.filters.distribution', args: {'0': label}});
    }
}

EntriesStore.registerFilterType(DistributionsFilter, (items, request) =>
{
    const distributionItem = new KalturaSearchOperator({
        type : KalturaSearchOperatorType.searchOr
    });

    request.advancedSearch.items.push(distributionItem);

    items.forEach(item =>
    {
        const newItem = new KalturaContentDistributionSearchItem(
            {
                distributionProfileId : item.value,
                hasEntryDistributionValidationErrors : false,
                noDistributionProfiles : false
            }
        );

        distributionItem.items.push(newItem)
    });
});
