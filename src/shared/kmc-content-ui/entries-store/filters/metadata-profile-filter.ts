
import { KalturaMetadataSearchItem, KalturaSearchCondition} from '@kaltura-ng2/kaltura-api/kaltura-types'

import {FilterRequestContext} from "../filter-item";
import {FilterItem} from '../filter-item';

export class MetadataProfileFilter  extends FilterItem{

    constructor(metadataProfileId : number, fieldPath : string[], value : string)
    {
        super(value);
    }

    _buildRequest(request : FilterRequestContext) : void {
        const item : KalturaMetadataSearchItem = new KalturaMetadataSearchItem();
        item.metadataProfileId = 122;
        item.items = [];
        item.items.push(new KalturaSearchCondition().setData(data =>
        {
            data.field = `/*[local-name()='metadata']/*[local-name()='Filter2']`;
            data.value = '1222';
        }))

    }
}
