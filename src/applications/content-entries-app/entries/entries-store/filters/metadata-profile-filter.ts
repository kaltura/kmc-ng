import * as R from 'ramda';

import { KalturaMetadataSearchItem, KalturaSearchCondition } from 'kaltura-typescript-client/types/all'
import { KalturaSearchOperatorType } from 'kaltura-typescript-client/types/all'

import { ValueFilter } from "../value-filter";
import { EntriesStore } from '../entries-store.service';
import { FilterItem } from '../filter-item';


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

    public isEqual(otherFilter : FilterItem) : boolean
    {
        return otherFilter instanceof MetadataProfileFilter
            && otherFilter._metadataProfileId === this._metadataProfileId
            && otherFilter._fieldPath === this._fieldPath
            && this.value === otherFilter.value;
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
        const metadataItem : KalturaMetadataSearchItem = new KalturaMetadataSearchItem(
            {
                metadataProfileId : metadataProfileId,
                type : KalturaSearchOperatorType.searchAnd,
                items : []
            }
        );
        request.advancedSearch.items.push(metadataItem);

        // group all metadata profile id items by filter field
        R.values(R.groupBy((item : MetadataProfileFilter) =>
        {
            return item.fieldPath.join(',');
        },groupItems)).forEach((filterItems : MetadataProfileFilter[])  =>
        {
            const innerMetadataItem : KalturaMetadataSearchItem = new KalturaMetadataSearchItem({});
            const filterField = R.reduce((acc : string, value : string) =>
            {
                return `${acc}/*[local-name()='${value}']`;
            },'',filterItems[0].fieldPath);

            innerMetadataItem.metadataProfileId = metadataProfileId;
            innerMetadataItem.type = KalturaSearchOperatorType.searchOr;
            innerMetadataItem.items = [];
            metadataItem.items.push(innerMetadataItem);

            filterItems.forEach(filterItem =>
            {
                const searchItem = new KalturaSearchCondition({
                    field : filterField,
                    value : filterItem.value
                });

                innerMetadataItem.items.push(searchItem);
            });
        });
    });
});
