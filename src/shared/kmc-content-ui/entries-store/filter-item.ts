import {
    KalturaMediaEntryFilter,
    KalturaSearchOperator
} from '@kaltura-ng2/kaltura-api/types'


export type UpdateArgs = {
    categories? : number[];
    createdAtFrom? : Date;
    createdAtTo? : Date;
    distributionProfiles? : number[];


    searchText? : string;

    statuses? : number[];
};


export interface FilterRequestContext
{
    filter : KalturaMediaEntryFilter,
    advancedSearch : KalturaSearchOperator
}

export abstract class FilterItem
{

    private _label : string;

    public get label() : string{
        return this._label;
    }

    private _tooltip : string;

    public get tooltip() : string{
        return this._tooltip;
    }

    constructor(label : string, tooltip : string = label)
    {
        this._label = label;
        this._tooltip = tooltip;

    }

     abstract _buildRequest(request : FilterRequestContext) : void;
}
