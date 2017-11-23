import { Injectable } from '@angular/core';
import { KalturaSearchOperator } from 'kaltura-typescript-client/types/KalturaSearchOperator';
import { KalturaMediaEntryFilter } from 'kaltura-typescript-client/types/KalturaMediaEntryFilter';
import { KalturaLogger } from '@kaltura-ng/kaltura-log';
import { FiltersStoreBase, TypeAdaptersMapping } from './filters-store-base';
import { SimpleTypeAdapter } from './filter-types/simple-type';

export interface EntriesFilters {
    freetext: string,
    createdAt : {
        createdBefore: Date,
        createdAfter: Date
    },
    mediaTypes : {value: any, label: string }[]
    /*mediaTypes : { [value:string]: { label: string}} TODO SAKAL */
}


@Injectable()
export class EntriesFiltersStore extends FiltersStoreBase<EntriesFilters> {

    constructor(_logger: KalturaLogger)
    {
        super(_logger);
    }

    protected _createEmptyStore(): EntriesFilters {
        return {
            freetext: '',
            createdAt: {createdAfter: null, createdBefore: null},
            mediaTypes: []
        };
    }

    protected _getTypeAdaptersMapping(): TypeAdaptersMapping<EntriesFilters> {
        return {
            freetext: new SimpleTypeAdapter<string>(),
            createdAt: new SimpleTypeAdapter<string>(),
            mediaTypes: new SimpleTypeAdapter<string>()
        };
    }

    public toRequest(request : { filter: KalturaMediaEntryFilter, advancedSearch: KalturaSearchOperator }) : void{
        // TODO sakal replace with adapters
        const data = this._getData();

        this._logger.info('assign filters to request', { filters: data});

        if (data.freetext) {
            request.filter.freeText = data.freetext;
        }

        //
        // if (filters.createdAt ) {
        //     if (filters.createdAt.createdAfter) {
        //         request.filter.createdAtGreaterThanOrEqual = KalturaUtils.getStartDateValue(filters.createdAt.createdAfter);
        //     }
        //
        //     if (filters.createdAt.createdBefore) {
        //         request.filter.createdAtLessThanOrEqual = KalturaUtils.getEndDateValue(filters.createdAt.createdBefore);
        //     }
        // }
        //
        // const mediaTypeFilters = filters.mediaTypes.map(item => item.value).join(',');
        // if (mediaTypeFilters) {
        //     request.filter.mediaTypeIn = mediaTypeFilters;
        // }
    }

}
