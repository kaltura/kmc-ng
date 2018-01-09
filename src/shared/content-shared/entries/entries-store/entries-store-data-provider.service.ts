import { Injectable } from '@angular/core';
import { EntriesDataProvider, EntriesFilters, MetadataProfileData, SortDirection } from './entries-store.service';
import { KalturaBaseEntry } from 'kaltura-ngx-client/api/types/KalturaBaseEntry';
import { Observable } from 'rxjs/Observable';
import { KalturaDetachedResponseProfile } from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import { KalturaMetadataSearchItem } from 'kaltura-ngx-client/api/types/KalturaMetadataSearchItem';
import { KalturaNullableBoolean } from 'kaltura-ngx-client/api/types/KalturaNullableBoolean';
import { KalturaSearchOperatorType } from 'kaltura-ngx-client/api/types/KalturaSearchOperatorType';
import { KalturaSearchOperator } from 'kaltura-ngx-client/api/types/KalturaSearchOperator';
import { KalturaSearchCondition } from 'kaltura-ngx-client/api/types/KalturaSearchCondition';
import { KalturaContentDistributionSearchItem } from 'kaltura-ngx-client/api/types/KalturaContentDistributionSearchItem';
import { KalturaLiveStreamEntry } from 'kaltura-ngx-client/api/types/KalturaLiveStreamEntry';
import { KalturaExternalMediaEntry } from 'kaltura-ngx-client/api/types/KalturaExternalMediaEntry';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { KalturaResponseProfileType } from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';
import { BaseEntryListAction } from 'kaltura-ngx-client/api/types/BaseEntryListAction';
import { KalturaMediaEntryFilter } from 'kaltura-ngx-client/api/types/KalturaMediaEntryFilter';
import { KalturaLiveStreamAdminEntry } from 'kaltura-ngx-client/api/types/KalturaLiveStreamAdminEntry';
import { KalturaUtils } from '@kaltura-ng/kaltura-common/utils/kaltura-utils';
import { ListType } from '@kaltura-ng/mc-shared/filters/filter-types/list-type';
import { KalturaClient } from 'kaltura-ngx-client';
import { CategoriesModes } from 'app-shared/content-shared/categories/categories-mode-type';



@Injectable()
export class EntriesStoreDataProvider implements EntriesDataProvider {
  constructor(private _kalturaServerClient: KalturaClient) {
  }


  public executeQuery(data: EntriesFilters, metadataProfiles: MetadataProfileData[]): Observable<{ entries: KalturaBaseEntry[], totalCount?: number }> {
    try {

                // create request items
                const filter: KalturaMediaEntryFilter = new KalturaMediaEntryFilter({});
                const responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
                    type: KalturaResponseProfileType.includeFields,
                    fields: 'id,name,thumbnailUrl,mediaType,plays,createdAt,duration,status,startDate,endDate,moderationStatus,tags,categoriesIds,downloadUrl,sourceType'
                });
                let pagination: KalturaFilterPager = null;

                const advancedSearch = filter.advancedSearch = new KalturaSearchOperator({});
                advancedSearch.type = KalturaSearchOperatorType.searchAnd;
        
                // filter 'freeText'
                if (data.freetext) {
                    filter.freeText = data.freetext;
                }

                // filter 'createdAt'
                if (data.createdAt) {
                    if (data.createdAt.fromDate) {
                        filter.createdAtGreaterThanOrEqual = KalturaUtils.getStartDateValue(data.createdAt.fromDate);
                    }

                    if (data.createdAt.toDate) {
                        filter.createdAtLessThanOrEqual = KalturaUtils.getEndDateValue(data.createdAt.toDate);
                    }
                }

                // filters of joined list
                this._updateFilterWithJoinedList(data.mediaTypes, filter, 'mediaTypeIn');
                this._updateFilterWithJoinedList(data.ingestionStatuses, filter, 'statusIn');
                this._updateFilterWithJoinedList(data.durations, filter, 'durationTypeMatchOr');
                this._updateFilterWithJoinedList(data.moderationStatuses, filter, 'moderationStatusIn');
                this._updateFilterWithJoinedList(data.replacementStatuses, filter, 'replacementStatusIn');
                this._updateFilterWithJoinedList(data.accessControlProfiles, filter, 'accessControlIdIn');
                this._updateFilterWithJoinedList(data.flavors, filter, 'flavorParamsIdsMatchOr');

                // filter 'distribution'
                if (data.distributions && data.distributions.length > 0) {
                    const distributionItem = new KalturaSearchOperator({
                        type: KalturaSearchOperatorType.searchOr
                    });

                    advancedSearch.items.push(distributionItem);

                    data.distributions.forEach(item => {
                        // very complex way to make sure the value is number (an also bypass both typescript and tslink checks)
                        if (isFinite(+item.value) && parseInt(item.value) == <any>item.value) { // tslint:disable-line
                            const newItem = new KalturaContentDistributionSearchItem(
                                {
                                    distributionProfileId: +item.value,
                                    hasEntryDistributionValidationErrors: false,
                                    noDistributionProfiles: false
                                }
                            );

                            distributionItem.items.push(newItem)
                        }
                    });
                }

                // filter 'originalClippedEntries'
                if (data.originalClippedEntries && data.originalClippedEntries.length > 0) {
                    let originalClippedEntriesValue: KalturaNullableBoolean = null;

                    data.originalClippedEntries.forEach(item => {
                        switch (item.value) {
                            case '0':
                                if (originalClippedEntriesValue == null) {
                                    originalClippedEntriesValue = KalturaNullableBoolean.falseValue;
                                } else if (originalClippedEntriesValue === KalturaNullableBoolean.trueValue) {
                                    originalClippedEntriesValue = KalturaNullableBoolean.nullValue;
                                }
                                break;
                            case '1':
                                if (originalClippedEntriesValue == null) {
                                    originalClippedEntriesValue = KalturaNullableBoolean.trueValue;
                                } else if (originalClippedEntriesValue === KalturaNullableBoolean.falseValue) {
                                    originalClippedEntriesValue = KalturaNullableBoolean.nullValue;
                                }
                                break;
                        }
                    });

                    if (originalClippedEntriesValue !== null) {
                        filter.isRoot = originalClippedEntriesValue;
                    }
                }

                // filter 'timeScheduling'
                if (data.timeScheduling && data.timeScheduling.length > 0) {
                    data.timeScheduling.forEach(item => {
                        switch (item.value) {
                            case 'past':
                                if (filter.endDateLessThanOrEqual === undefined || filter.endDateLessThanOrEqual < (new Date())) {
                                    filter.endDateLessThanOrEqual = (new Date());
                                }
                                break;
                            case 'live':
                                if (filter.startDateLessThanOrEqualOrNull === undefined || filter.startDateLessThanOrEqualOrNull > (new Date())) {
                                    filter.startDateLessThanOrEqualOrNull = (new Date());
                                }
                                if (filter.endDateGreaterThanOrEqualOrNull === undefined || filter.endDateGreaterThanOrEqualOrNull < (new Date())) {
                                    filter.endDateGreaterThanOrEqualOrNull = (new Date());
                                }
                                break;
                            case 'future':
                                if (filter.startDateGreaterThanOrEqual === undefined || filter.startDateGreaterThanOrEqual > (new Date())) {
                                    filter.startDateGreaterThanOrEqual = (new Date());
                                }
                                break;
                            case 'scheduled':
                                if (data.scheduledAt.fromDate) {
                                    if (filter.startDateGreaterThanOrEqual === undefined
                                        || filter.startDateGreaterThanOrEqual > (KalturaUtils.getStartDateValue(data.scheduledAt.fromDate))
                                    ) {
                                        filter.startDateGreaterThanOrEqual = (KalturaUtils.getStartDateValue(data.scheduledAt.fromDate));
                                    }
                                }

                                if (data.scheduledAt.toDate) {
                                    if (filter.endDateLessThanOrEqual === undefined
                                        || filter.endDateLessThanOrEqual < (KalturaUtils.getEndDateValue(data.scheduledAt.toDate))
                                    ) {
                                        filter.endDateLessThanOrEqual = (KalturaUtils.getEndDateValue(data.scheduledAt.toDate));
                                    }
                                }

                                break;
                            default:
                                break
                        }
                    });
                }

                // filters of custom metadata lists
                if (metadataProfiles && metadataProfiles.length > 0) {

                    metadataProfiles.forEach(metadataProfile => {
                        // create advanced item for all metadata profiles regardless if the user filtered by them or not.
                        // this is needed so freetext will include all metadata profiles while searching.
                        const metadataItem: KalturaMetadataSearchItem = new KalturaMetadataSearchItem(
                            {
                                metadataProfileId: metadataProfile.id,
                                type: KalturaSearchOperatorType.searchAnd,
                                items: []
                            }
                        );
                        advancedSearch.items.push(metadataItem);

                        metadataProfile.lists.forEach(list => {
                            const metadataProfileFilters = data.customMetadata[list.id];
                            if (metadataProfileFilters && metadataProfileFilters.length > 0) {
                                const innerMetadataItem: KalturaMetadataSearchItem = new KalturaMetadataSearchItem({
                                    metadataProfileId: metadataProfile.id,
                                    type: KalturaSearchOperatorType.searchOr,
                                    items: []
                                });
                                metadataItem.items.push(innerMetadataItem);

                                metadataProfileFilters.forEach(filterItem => {
                                    const searchItem = new KalturaSearchCondition({
                                        field: `/*[local-name()='metadata']/*[local-name()='${list.name}']`,
                                        value: filterItem.value
                                    });

                                    innerMetadataItem.items.push(searchItem);
                                });
                            }
                        });
                    });
                }

                if (data.categories && data.categories.length) {
                    const categoriesValue = data.categories.map(item => item.value).join(',');
                    if (data.categoriesMode === CategoriesModes.SelfAndChildren) {
                        filter.categoryAncestorIdIn = categoriesValue;
                    } else {
                        filter.categoriesIdsMatchOr = categoriesValue;
                    }
                }

                // remove advanced search arg if it is empty
                if (advancedSearch.items && advancedSearch.items.length === 0) {
                    delete filter.advancedSearch;
                }

                // handle default value for media types
                if (!filter.mediaTypeIn) {
                    filter.mediaTypeIn = '1,2,5,6,201';
                }

                // handle default value for statuses
                if (!filter.statusIn) {
                    filter.statusIn = '-1,-2,0,1,2,7,4';
                }


                // update the sort by args
                if (data.sortBy) {
                    filter.orderBy = `${data.sortDirection === SortDirection.Desc ? '-' : '+'}${data.sortBy}`;
                }


                // update pagination args
                if (data.pageIndex || data.pageSize) {
                    pagination = new KalturaFilterPager(
                        {
                            pageSize: data.pageSize,
                            pageIndex: data.pageIndex + 1
                        }
                    );
                }

      // build the request
      return <any>this._kalturaServerClient.request(
        new BaseEntryListAction({
          filter,
          pager: pagination,
          responseProfile,
          acceptedTypes: [KalturaLiveStreamAdminEntry, KalturaLiveStreamEntry, KalturaExternalMediaEntry]
        })
      ).map(response => ({
          entries: response.objects,
          totalCount: response.totalCount
        })
      );
    } catch (err) {
      return Observable.throw(err);
    }

  }

  public queryDuringBootstrap(): boolean {
    return true;
  }

  private _updateFilterWithJoinedList(list: ListType,
                                      requestFilter: KalturaMediaEntryFilter,
                                      requestFilterProperty: keyof KalturaMediaEntryFilter): void {
    const value = (list || []).map(item => item.value).join(',');

    if (value) {
      requestFilter[requestFilterProperty] = value;
    }
  }
}
