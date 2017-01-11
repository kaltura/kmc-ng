import {
    KalturaContentDistributionSearchItem,
    KalturaSearchOperator,
    KalturaMediaEntryFilter,
    KalturaDetachedResponseProfile,
    KalturaFilterPager,
    KalturaBaseEntryListResponse,
    KalturaResponseProfileType
} from '@kaltura-ng2/kaltura-api/types'


export type UpdateArgs = {
    categories? : number[];
    createdAtFrom? : Date;
    createdAtTo? : Date;
    distributionProfiles? : number[];
    filterColumns?: string;
    pageIndex : number;
    pageSize : number;
    searchText? : string;
    sortBy : string;
    sortDirection : SortDirection;
    statuses? : number[];
};

export enum SortDirection {
    Desc,
    Asc
}

export interface FilterRequestContext
{
    filter : KalturaMediaEntryFilter
}

export abstract class FilterItem
{

    constructor(public label : string)
    {


    }

     abstract _buildRequest(request : FilterRequestContext) : void;
}
