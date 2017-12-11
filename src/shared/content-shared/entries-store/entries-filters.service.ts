import { Injectable } from '@angular/core';
import { KalturaSearchOperator } from 'kaltura-ngx-client/api/types/KalturaSearchOperator';
import { KalturaMediaEntryFilter } from 'kaltura-ngx-client/api/types/KalturaMediaEntryFilter';
import { KalturaLogger } from '@kaltura-ng/kaltura-log';
import { FiltersStoreBase, TypeAdaptersMapping } from './filters-store-base';
import { StringTypeAdapter } from './filter-types/string-type';
import { DatesRangeAdapter, DatesRangeType } from './filter-types/dates-range-type';
import { ValuesListAdapter, ValuesListType } from './filter-types/values-list-type';
import { KalturaUtils } from '@kaltura-ng/kaltura-common';

export interface EntriesFilters {
    freetext: string,
    createdAt: DatesRangeType,
    mediaTypes: ValuesListType,
    ingestionStatuses: ValuesListType
}


@Injectable()
export class EntriesFiltersStore extends FiltersStoreBase<EntriesFilters> {

    constructor(_logger: KalturaLogger) {
        super(_logger);
    }

    protected _createEmptyStore(): EntriesFilters {
        return {
            freetext: '',
            createdAt: {fromDate: null, toDate: null},
            mediaTypes: [],
            ingestionStatuses: []
        };
    }

    protected _getTypeAdaptersMapping(): TypeAdaptersMapping<EntriesFilters> {
        return {
            freetext: new StringTypeAdapter(),
            createdAt: new DatesRangeAdapter(),
            mediaTypes: new ValuesListAdapter(),
            ingestionStatuses: new ValuesListAdapter()
        };
    }

    public toRequest(request: { filter: KalturaMediaEntryFilter, advancedSearch: KalturaSearchOperator }) : void{
        // TODO sakal replace with adapters
        const data = this._getData();

        this._logger.info('assign filters to request', { filters: data});

        if (data.freetext) {
            request.filter.freeText = data.freetext;
        }


        if (data.createdAt ) {
            if (data.createdAt.fromDate) {
                request.filter.createdAtGreaterThanOrEqual = KalturaUtils.getStartDateValue(data.createdAt.fromDate);
            }

            if (data.createdAt.toDate) {
                request.filter.createdAtLessThanOrEqual = KalturaUtils.getEndDateValue(data.createdAt.toDate);
            }
        }

        const mediaTypeFilters = data.mediaTypes.map(item => item.value).join(',');

        if (mediaTypeFilters) {
            request.filter.mediaTypeIn = mediaTypeFilters;
        }

        const ingestionStatuses = data.ingestionStatuses.map(item => item.value).join(',');

        if (ingestionStatuses) {
            request.filter.statusIn = ingestionStatuses;
        }
    }

}
