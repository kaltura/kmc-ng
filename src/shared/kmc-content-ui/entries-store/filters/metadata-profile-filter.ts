
import { KalturaMetadataSearchItem, KalturaSearchCondition} from '@kaltura-ng2/kaltura-api/kaltura-types'
import { KalturaSearchOperatorType} from '@kaltura-ng2/kaltura-api/kaltura-enums'

import {FilterRequestContext} from "../filter-item";

import {ValueFilter} from "../value-filter";

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
        const item : KalturaMetadataSearchItem = new KalturaMetadataSearchItem();
        item.metadataProfileId = this.metadataProfileId;
        item.items = [];
        item.items.push(new KalturaSearchCondition().setData(data =>
        {
            data.field = `/*[local-name()='metadata']/*[local-name()='Filter2']`;
            data.value = '1222';
        }))

        // let metadataItem : KalturaMetadataSearchItem = request.advancedSearch.items.find(item =>
        // {
        //     if (item instanceof KalturaMetadataSearchItem) {
        //         const metadataItem: KalturaMetadataSearchItem = <KalturaMetadataSearchItem>item;
        //
        //         return metadataItem.metadataProfileId === this._metadataProfileId;
        //     }
        //
        //     return false;
        // })
        //
        // if (!metadataItem)
        // {
        //     metadataItem = new KalturaMetadataSearchItem();
        //     metadataItem.metadataProfileId = this._metadataProfileId;
        //     metadataItem.type = KalturaSearchOperatorType.SearchAnd;
        //     metadataItem.items = [];
        //     request.advancedSearch.items.push(metadataItem);
        //
        // }
        //
        // metadataItem.items.push()



    }
}
