import { Injectable } from '@angular/core';
import { KalturaSearchOperator } from 'kaltura-ngx-client/api/types/KalturaSearchOperator';
import { KalturaMediaEntryFilter } from 'kaltura-ngx-client/api/types/KalturaMediaEntryFilter';
import { KalturaLogger } from '@kaltura-ng/kaltura-log';
import { FiltersStoreBase, TypeAdaptersMapping } from './filters-store-base';
import { StringTypeAdapter } from './filter-types/string-type';
import { DatesRangeAdapter, DatesRangeType } from './filter-types/dates-range-type';
import { ListAdapter, ListType } from './filter-types/list-type';
import { KalturaUtils } from '@kaltura-ng/kaltura-common';
import {
    GroupedListAdapter,
    GroupedListType
} from 'app-shared/content-shared/entries-store/filter-types/grouped-list-type';

export interface EntriesFilters {
    freetext: string,
    createdAt: DatesRangeType,
    scheduledAt: DatesRangeType,
    mediaTypes: ListType,
    timeScheduling: ListType,
    ingestionStatuses: ListType,
    customMetadata: GroupedListType
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
            scheduledAt: {fromDate: null, toDate: null},
            mediaTypes: [],
            timeScheduling: [],
            ingestionStatuses: [],
            customMetadata : {}
        };
    }

    protected _getTypeAdaptersMapping(): TypeAdaptersMapping<EntriesFilters> {
        return {
            freetext: new StringTypeAdapter(),
            createdAt: new DatesRangeAdapter(),
            scheduledAt: new DatesRangeAdapter(),
            mediaTypes: new ListAdapter(),
            timeScheduling: new ListAdapter(),
            ingestionStatuses: new ListAdapter(),
            customMetadata: new GroupedListAdapter()
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

        data.timeScheduling.forEach(item => {
            switch (item.value) {
                case 'past':
                    if (request.filter.endDateLessThanOrEqual === undefined || request.filter.endDateLessThanOrEqual < (new Date())) {
                        request.filter.endDateLessThanOrEqual = (new Date());
                    }
                    break;
                case 'live':
                    if (request.filter.startDateLessThanOrEqualOrNull === undefined || request.filter.startDateLessThanOrEqualOrNull > (new Date())) {
                        request.filter.startDateLessThanOrEqualOrNull = (new Date());
                    }
                    if (request.filter.endDateGreaterThanOrEqualOrNull === undefined || request.filter.endDateGreaterThanOrEqualOrNull < (new Date())) {
                        request.filter.endDateGreaterThanOrEqualOrNull = (new Date());
                    }
                    break;
                case 'future':
                    if (request.filter.startDateGreaterThanOrEqual === undefined || request.filter.startDateGreaterThanOrEqual > (new Date())) {
                        request.filter.startDateGreaterThanOrEqual = (new Date());
                    }
                    break;
                case 'scheduled':
                    if (data.scheduledAt.fromDate) {
                        if (request.filter.startDateGreaterThanOrEqual === undefined
                            || request.filter.startDateGreaterThanOrEqual > (KalturaUtils.getStartDateValue(data.scheduledAt.fromDate))
                        ) {
                            request.filter.startDateGreaterThanOrEqual = (KalturaUtils.getStartDateValue(data.scheduledAt.fromDate));
                        }
                    }

                    if (data.scheduledAt.toDate) {
                        if (request.filter.endDateLessThanOrEqual === undefined
                            || request.filter.endDateLessThanOrEqual < (KalturaUtils.getEndDateValue(data.scheduledAt.toDate))
                        ) {
                            request.filter.endDateLessThanOrEqual = (KalturaUtils.getEndDateValue(data.scheduledAt.toDate));
                        }
                    }

                    break;
                default:
                    break
            }
        });
    }

}
