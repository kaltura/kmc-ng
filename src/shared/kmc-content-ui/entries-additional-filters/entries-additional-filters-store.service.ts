import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { KalturaServerClient, KalturaMetadataObjectType, KalturaMultiRequest } from '@kaltura-ng2/kaltura-api';
import { FlavorParamsListAction } from '@kaltura-ng2/kaltura-api/services/flavor-params';
import { MetadataProfileListAction } from '@kaltura-ng2/kaltura-api/services/metadata-profile';
import { AccessControlListAction } from '@kaltura-ng2/kaltura-api/services/access-control';
import { DistributionProfileListAction } from '@kaltura-ng2/kaltura-api/services/distribution-profile';
import { MetadataProfileParser, MetadataFieldTypes } from '@kaltura-ng2/kaltura-common/kaltura-metadata-parser';

import {
    KalturaAccessControlFilter,
    KalturaAccessControlProfile,
    KalturaDetachedResponseProfile,
    KalturaDistributionProfile,
    KalturaFilterPager,
    KalturaFlavorParams,
    KalturaMetadataProfileCreateMode,
    KalturaMetadataProfileFilter,
    KalturaResponseProfileType
} from '@kaltura-ng2/kaltura-api/types'

import { ConstantsFilters } from './constant-filters';

import * as R from 'ramda';

export class FilterGroupType
{
    constructor(public type : string, public caption : string)
    {

    }
}

export class filterGroupMetadataProfileType extends FilterGroupType
{
    constructor(type : string,caption : string, public metadataProfileId : number, public fieldPath : string[])
    {
        super(type,caption);
    }
}

export interface FilterGroup
{
    groupName : string,
    filtersTypes : FilterGroupType[]
    filtersByType : { [key : string] : {id : string, name : string}[]}
}

export interface AdditionalFilters
{
    groups : FilterGroup[];
    metadataProfiles : number[];
}


export enum AdditionalFilterLoadingStatus
{
    Loading,
    Loaded,
    FailedToLoad
}

@Injectable()
export class EntriesAdditionalFiltersStore {

    // TODO [KMC] - clear cached data on logout
    private _additionalFilters: ReplaySubject<AdditionalFilters> = new ReplaySubject<AdditionalFilters>(1);
    public additionalFilters$ = this._additionalFilters.asObservable();
    private _status : BehaviorSubject<{ dataLoad? : AdditionalFilterLoadingStatus, error? : string}> = new BehaviorSubject<{ dataLoad? : AdditionalFilterLoadingStatus, error? : string}>(null);
    public status$ = this._status.asObservable();


    constructor(private kalturaServerClient: KalturaServerClient) {
        this.load();
    }

    private load() : void {
        if (!this._status.getValue()) {
            this._status.next({dataLoad: AdditionalFilterLoadingStatus.Loading});

            const metadataProfilesFilter = new KalturaMetadataProfileFilter();
            metadataProfilesFilter.createModeNotEqual = KalturaMetadataProfileCreateMode.App;
            metadataProfilesFilter.orderBy = '-createdAt';
            metadataProfilesFilter.metadataObjectTypeEqual = KalturaMetadataObjectType.Entry;

            const accessControlFilter = new KalturaAccessControlFilter();
            accessControlFilter.orderBy = '-createdAt';

            const distributionProfilePager = new KalturaFilterPager();
            distributionProfilePager.pageSize = 500;

            const accessControlPager = new KalturaFilterPager();
            distributionProfilePager.pageSize = 1000;

            const responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile();
            responseProfile.setData(data => {
                data.fields = "id,name";
                data.type = KalturaResponseProfileType.IncludeFields;
            });

            const request = new KalturaMultiRequest(
                new MetadataProfileListAction({filter: metadataProfilesFilter}),
                new DistributionProfileListAction({pager: distributionProfilePager}),
                new FlavorParamsListAction({pager: distributionProfilePager, responseProfile}),
                new AccessControlListAction({
                    pager: accessControlPager,
                    filter: accessControlFilter,
                    responseProfile
                }),
            );

            this.kalturaServerClient.multiRequest(request)
                .subscribe(
                    (responses) => {
                        if (responses.hasErrors()) {
                            this._status.next({
                                dataLoad: AdditionalFilterLoadingStatus.FailedToLoad,
                                error: 'failed to load refine filters'
                            });

                        } else {

                            const filters : AdditionalFilters = {groups : [], metadataProfiles : []};

                            const defaultFilterGroup = {groupName : '', filtersTypes : [], filtersByType : {}};
                            filters.groups.push(defaultFilterGroup);

                            // build constant filters
                            ConstantsFilters.forEach((filter) =>
                            {
                                defaultFilterGroup.filtersTypes.push(new FilterGroupType(filter.type,filter.name));
                                const items = defaultFilterGroup.filtersByType[filter.type] = [];
                                filter.items.forEach((item: any) => {
                                    items.push({id : item.id, name : item.name});
                                });
                            });

                            // build distributions filters
                            if (responses[1].result.objects.length > 0) {
                                defaultFilterGroup.filtersTypes.push(new FilterGroupType('distributions',"Destinations"));
                                const items = defaultFilterGroup.filtersByType['distributions'] = [];
                                responses[1].result.objects.forEach((distributionProfile: KalturaDistributionProfile) => {
                                    items.push({id : distributionProfile.id, name : distributionProfile.name});
                                });
                            }

                            // build flavors filters
                            if (responses[2].result.objects.length > 0) {
                                defaultFilterGroup.filtersTypes.push(new FilterGroupType('flavors',"Flavors"));
                                const items = defaultFilterGroup.filtersByType['flavors'] = [];
                                responses[2].result.objects.forEach((flavor: KalturaFlavorParams) => {
                                    items.push({id: flavor.id, name: flavor.name});
                                });
                            }

                            // build access control profile filters
                            if (responses[3].result.objects.length > 0) {
                                defaultFilterGroup.filtersTypes.push(new FilterGroupType('accessControlProfiles','Access Control Profiles'));
                                const items = defaultFilterGroup.filtersByType['accessControlProfiles'] = [];
                                responses[3].result.objects.forEach((accessControlProfile: KalturaAccessControlProfile) => {
                                    items.push({
                                        id: accessControlProfile.id,
                                        name: accessControlProfile.name
                                    });
                                });
                            }

                            // build metadata profile filters
                            const parser = new MetadataProfileParser();

                            if (responses[0].result.objects && responses[0].result.objects.length > 0)
                            {
                                responses[0].result.objects.forEach(kalturaProfile =>
                                {
                                    const metadataProfile = parser.parse(kalturaProfile);

                                    if (metadataProfile)
                                    {
                                        filters.metadataProfiles.push(metadataProfile.id);

                                        // get only fields that are list, searchable and has values
                                        const profileLists = R.filter(field =>
                                        {
                                            return (field.type === MetadataFieldTypes.List && field.isSearchable && field.optionalValues.length > 0);
                                        }, metadataProfile.fields);

                                        // if found relevant lists, create a group for that profile
                                        if (profileLists && profileLists.length > 0) {
                                            const filterGroup = {groupName: metadataProfile.name, filtersTypes: [], filtersByType : {}};
                                            filters.groups.push(filterGroup);

                                            profileLists.forEach(list => {
                                                filterGroup.filtersTypes.push(new filterGroupMetadataProfileType(list.id, list.label, metadataProfile.id,list.path));
                                                const items = filterGroup.filtersByType[list.id] = [];

                                                list.optionalValues.forEach(value => {
                                                    items.push({
                                                        id: value,
                                                        name: value
                                                    })

                                                });
                                            });
                                        }

                                    }
                                });
                            }

                            this._additionalFilters.next(filters);
                            this._status.next({ dataLoad : AdditionalFilterLoadingStatus.Loaded});
                        }
                    },
                    () => {
                        this._status.next({
                            dataLoad: AdditionalFilterLoadingStatus.FailedToLoad,
                            error: 'failed to load redine filters'
                        });
                    }
                )
        }
    }
}
