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
import { NumberTypeAdapter } from 'app-shared/content-shared/entries-store/filter-types/number-type';
import { KalturaDetachedResponseProfile } from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { KalturaSearchOperatorType } from 'kaltura-ngx-client/api/types/KalturaSearchOperatorType';
import { SortDirection } from 'app-shared/content-shared/entries-store/entries-store.service';

export interface EntriesFilters {
    freetext: string,
    pageSize: number,
    pageIndex: number,
    sortBy: string,
    sortDirection: number,
    fields: string,
    createdAt: DatesRangeType,
    scheduledAt: DatesRangeType,
    mediaTypes: ListType,
    timeScheduling: ListType,
    ingestionStatuses: ListType,
    durations: ListType,
    originalClippedEntries: ListType,
    moderationStatuses: ListType,
    replacementStatuses: ListType,
    accessControlProfiles: ListType,
    flavors: ListType,
    distributions: ListType,
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
            pageSize: 50,
            pageIndex: 0,
            sortBy: 'createdAt',
            sortDirection: SortDirection.Desc,
            fields: 'id,name,thumbnailUrl,mediaType,plays,createdAt,duration,status,startDate,endDate,moderationStatus,tags,categoriesIds,downloadUrl',
            createdAt: {fromDate: null, toDate: null},
            scheduledAt: {fromDate: null, toDate: null},
            mediaTypes: [],
            timeScheduling: [],
            ingestionStatuses: [],
            durations: [],
            originalClippedEntries: [],
            moderationStatuses: [],
            replacementStatuses: [],
            accessControlProfiles: [],
            flavors: [],
            distributions: [],
            customMetadata : {}
        };
    }

    protected _getTypeAdaptersMapping(): TypeAdaptersMapping<EntriesFilters> {
        return {
            freetext: new StringTypeAdapter(),
            pageSize: new NumberTypeAdapter(),
            pageIndex: new NumberTypeAdapter(),
            sortBy: new StringTypeAdapter(),
            sortDirection: new NumberTypeAdapter(),
            fields: new StringTypeAdapter(),
            createdAt: new DatesRangeAdapter(),
            scheduledAt: new DatesRangeAdapter(),
            mediaTypes: new ListAdapter(),
            timeScheduling: new ListAdapter(),
            ingestionStatuses: new ListAdapter(),
            durations: new ListAdapter(),
            originalClippedEntries: new ListAdapter(),
            moderationStatuses: new ListAdapter(),
            replacementStatuses: new ListAdapter(),
            accessControlProfiles: new ListAdapter(),
            flavors: new ListAdapter(),
            distributions: new ListAdapter(),
            customMetadata: new GroupedListAdapter()
        };
    }
}
