

import {FilterItem, FilterRequestContext} from "../filter-item";
export class MediaTypesFilter  extends FilterItem{


    constructor(public mediaType : string, label : string)
    {
        super(label);

    }

    _buildRequest(request : FilterRequestContext) : void {

        if (typeof request.filter.mediaTypeIn !== 'undefined')
        {
            request.filter.mediaTypeIn += `,${this.mediaType}`;
        }else
        {
            request.filter.mediaTypeIn = this.mediaType;
        }
    }
}
