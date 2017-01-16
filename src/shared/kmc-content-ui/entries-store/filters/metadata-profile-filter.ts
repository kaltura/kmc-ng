
import { KalturaMetadataSearchItem, KalturaSearchCondition} from '@kaltura-ng2/kaltura-api/kaltura-types'
import { KalturaSearchOperatorType} from '@kaltura-ng2/kaltura-api/kaltura-enums'

import {FilterRequestContext} from "../filter-item";

import {ValueFilter} from "../value-filter";

import {EntriesStore} from '../entries-store.service';

import * as R from 'ramda';

export class MetadataProfileFilter  extends ValueFilter<string>{

    private _metadataProfileId : number;

    public get metadataProfileId() : number{
        return this._metadataProfileId;
    }

    private _fieldPath : string[];

    public get fieldPath() : string[]{
        return this._fieldPath;
    }
    constructor(metadataProfileId : number, fieldPath : string[], value : string)
    {
        super(value, value);
        this._metadataProfileId = metadataProfileId;
        this._fieldPath = fieldPath;
    }

    _buildRequest(request : FilterRequestContext) : void {
        // do nothing

    }
}

EntriesStore.registerFilterType(MetadataProfileFilter, (items, request) =>
{

    // group all filters by metadata profile id
    R.values(R.groupBy((item : MetadataProfileFilter) =>
    {
        return item.metadataProfileId + '';
    },items)).forEach((groupItems : MetadataProfileFilter[])  =>
    {
        // create metadata search item for each profile
        const metadataProfileId = groupItems[0].metadataProfileId;
        const metadataItem : KalturaMetadataSearchItem = new KalturaMetadataSearchItem();
        metadataItem.metadataProfileId = metadataProfileId;
        metadataItem.type = KalturaSearchOperatorType.SearchAnd;
        metadataItem.items = [];
        request.advancedSearch.items.push(metadataItem);

        // group all metadata profile id items by filter field
        R.values(R.groupBy((item : MetadataProfileFilter) =>
        {
            return item.fieldPath.join(',');
        },groupItems)).forEach((filterItems : MetadataProfileFilter[])  =>
        {
            const innerMetadataItem : KalturaMetadataSearchItem = new KalturaMetadataSearchItem();
            const filterField = R.reduce((acc : string, value : string) =>
            {
                return `${acc}/*[local-name()='${value}']`;
            },'',filterItems[0].fieldPath);

            innerMetadataItem.metadataProfileId = metadataProfileId;
            innerMetadataItem.type = KalturaSearchOperatorType.SearchOr;
            innerMetadataItem.items = [];
            metadataItem.items.push(innerMetadataItem);

            filterItems.forEach(filterItem =>
            {
                const searchItem = new KalturaSearchCondition();
                searchItem.field = filterField;
                searchItem.value = filterItem.value;
                innerMetadataItem.items.push(searchItem);
            });
        });
    });
});
