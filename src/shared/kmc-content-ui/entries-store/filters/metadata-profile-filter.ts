import * as R from 'ramda';

import { KalturaMetadataSearchItem, KalturaSearchCondition } from '@kaltura-ng2/kaltura-api/kaltura-types'
import { KalturaSearchOperatorType } from '@kaltura-ng2/kaltura-api/kaltura-enums'

import { ValueFilter } from "../value-filter";
import { EntriesStore } from '../entries-store.service';


export class MetadataProfileFilter  extends ValueFilter<string>{

    private _metadataProfileId : number;

    public get metadataProfileId() : number{
        return this._metadataProfileId;
    }

    private _fieldPath : string[];

    public get fieldPath() : string[]{
        return this._fieldPath;
    }

    private _listTypeName : string;

    public get listTypeName() : string{
        return this._listTypeName;
    }

    constructor(metadataProfileId : number, listTypeName : string,  fieldPath : string[], value : string, caption: string)
    {
        super(value, value, {token: 'applications.content.filters.metaData', args: {'0': caption, '1': value}});
        this._listTypeName = listTypeName;
        this._metadataProfileId = metadataProfileId;
        this._fieldPath = fieldPath;
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
