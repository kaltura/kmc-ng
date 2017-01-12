

import {FilterItem, FilterRequestContext} from "../filter-item";
export class MediaTypesFilter  extends FilterItem{

    private _mediaType : string;

    public get mediaType() : string{
        return this._mediaType;
    }

    constructor(mediaType : string, label : string)
    {
        super(label);
        this._mediaType = mediaType;
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
