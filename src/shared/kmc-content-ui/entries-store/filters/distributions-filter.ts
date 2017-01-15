
import {
    KalturaSearchOperator,
    KalturaContentDistributionSearchItem
} from '@kaltura-ng2/kaltura-api/types'

import { KalturaSearchOperatorType} from '@kaltura-ng2/kaltura-api/kaltura-enums'

import {FilterRequestContext} from "../filter-item";
import {ValueFilter} from '../value-filter';

export class DistributionsFilter  extends ValueFilter<number>{

    constructor(value : number, label : string)
    {
        super(value, label);
    }

    _buildRequest(request : FilterRequestContext) : void {
        const advancedSearch = <KalturaSearchOperator>request.filter.advancedSearch;
        let distributionItem = null;
        if (advancedSearch.items && advancedSearch.items.length > 0)
        {
            // find an item that holds 'KalturaContentDistributionSearchItem'
            distributionItem = advancedSearch.items.filter(item => {
                return item instanceof KalturaSearchOperator &&
                    item.items && item.items.length > 0 &&
                        item.items[0] instanceof KalturaContentDistributionSearchItem;
            }, advancedSearch.items);
        }

        if (!distributionItem)
        {
            distributionItem = new KalturaSearchOperator();
            distributionItem.type = KalturaSearchOperatorType.SearchOr;
            advancedSearch.items.push(distributionItem);
        }


        const newItem = new KalturaContentDistributionSearchItem();
        newItem.distributionProfileId = this.value;
        newItem.hasEntryDistributionValidationErrors = false;
        newItem.noDistributionProfiles = false;
        distributionItem.items.push(newItem)
    }
}
