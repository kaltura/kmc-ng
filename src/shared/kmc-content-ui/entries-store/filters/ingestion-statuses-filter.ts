

import {FilterItem, FilterRequestContext} from "../filter-item";
export class IngestionStatusesFilter  extends FilterItem{


    private _statuses : string;

    public get statuses() : string{
        return this._statuses;
    }

    constructor(statuses : string, label : string)
    {
        super(label);
        this._statuses = statuses;
    }

    _buildRequest(request : FilterRequestContext) : void {
        if (typeof request.filter.statusIn !== 'undefined')
        {
            request.filter.statusIn += `,${this.statuses}`;
        }else
        {
            request.filter.statusIn = this.statuses;
        }
    }
}
