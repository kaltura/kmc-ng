import {
    KalturaMediaEntryFilter,
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
    filter : KalturaMediaEntryFilter
}

export abstract class FilterItem
{

    constructor(public label : string, public tooltip : string = label)
    {


    }

     abstract _buildRequest(request : FilterRequestContext) : void;
}
