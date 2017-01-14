
import {
    KalturaSearchOperator,
    KalturaContentDistributionSearchItem
} from '@kaltura-ng2/kaltura-api/types'

import { KalturaSearchOperatorType} from '@kaltura-ng2/kaltura-api/kaltura-enums'


import {FilterItem, FilterRequestContext} from "../filter-item";
export class DistributionsFilter  extends FilterItem{


    private _value : number;

    public get value() : number{
        return this._value;
    }

    constructor(value : number, label : string)
    {
        super(label);
        this._value = value;

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
        newItem.distributionProfileId = this._value;
        newItem.hasEntryDistributionValidationErrors = false;
        newItem.noDistributionProfiles = false;
        distributionItem.items.push(newItem)
    }
}
