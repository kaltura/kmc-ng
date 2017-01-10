import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ReplaySubject} from 'rxjs/ReplaySubject';

import {KalturaServerClient, KalturaMetadataObjectType, KalturaMultiRequest, KalturaResponse} from '@kaltura-ng2/kaltura-api';
import {FlavorParamsListAction} from '@kaltura-ng2/kaltura-api/services/flavor-params';
import {MetadataProfileListAction} from '@kaltura-ng2/kaltura-api/services/metadata-profile';
import {AccessControlListAction} from '@kaltura-ng2/kaltura-api/services/access-control';
import {DistributionProfileListAction} from '@kaltura-ng2/kaltura-api/services/distribution-profile';

import {
    KalturaMetadataProfileFilter,
    KalturaAccessControlFilter,
    KalturaFilterPager,
    KalturaDetachedResponseProfile,
    KalturaResponseProfileType,
    KalturaFlavorParams,
    KalturaAccessControlProfile,
    KalturaDistributionProfile,
    KalturaMetadataProfile
} from '@kaltura-ng2/kaltura-api/types'

import {ConstantsFilters} from './constant-filters';

import * as R from 'ramda';

export class AdditionalFilter {
    id: string;
    label = "";
    filterName: string;
    children: AdditionalFilter[] = [];

    constructor(filterName: string, id: string, label: string) {
        this.filterName = filterName;
        this.id = id;
        this.label = label;
    }
}
export class MetadataFilter extends AdditionalFilter{
    constructor(filterName: string, id: string, label: string) {
        super(filterName, id, label);
    }
}

export class MetadataProfileFilter {
    label?: string;
    data?: string;
    children?: any[];
}
export class MetadataProfileFilterGroup {
    label?: string;
    filters?: MetadataProfileFilter[];
}

export interface FilterItem
{
    value : string;
    name : string;
}

export interface FilterType
{ type : string, caption : string }

export interface Filters
{
    filtersGroups : { groupName : string, filtersTypes : FilterType[]}[];
    filtersByType : { [key : string] : FilterItem[]}
}


export enum AdditionalFilterLoadingStatus
{
    Loading,
    Loaded,
    FailedToLoad
}
@Injectable()
export class ContentAdditionalFiltersStore {

    // TODO [KMC] - clear cached data on logout
    private _additionalFilters: ReplaySubject<Filters> = new ReplaySubject<Filters>(1);
    public additionalFilters$ = this._additionalFilters.asObservable();
    private _status : BehaviorSubject<{ dataLoad? : AdditionalFilterLoadingStatus, error? : string}> = new BehaviorSubject<{ dataLoad? : AdditionalFilterLoadingStatus, error? : string}>(null);
    public status$ = this._status.asObservable();


    constructor(private kalturaServerClient: KalturaServerClient) {
        this.load();
    }

    private metadataFilters: any[] = [];

    private load() : void {
        if (!this._status.getValue()) {
            this._status.next({dataLoad: AdditionalFilterLoadingStatus.Loading});

            const metadataProfilesFilter = new KalturaMetadataProfileFilter();
            metadataProfilesFilter.createModeNotEqual = 3;
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

                            const filters : Filters = {filtersGroups : [], filtersByType : {}};

                            const defaultFilterGroup = {groupName : '', filtersTypes : []};
                            filters.filtersGroups.push(defaultFilterGroup);

                            // build constant filters
                            ConstantsFilters.forEach((filter) =>
                            {
                                defaultFilterGroup.filtersTypes.push({ type : filter.type, caption : filter.name});
                                const items = filters.filtersByType[filter.type] = [];
                                filter.items.forEach((item: any) => {
                                    items.push({value : item.value, name : item.name});
                                });
                            });

                            // build distributions filter
                            if (responses[1].result.objects.length > 0) {
                                defaultFilterGroup.filtersTypes.push({ type : 'distributions', caption : 'Destinations'});
                                const items = filters.filtersByType['distributions'] = [];
                                responses[1].result.objects.forEach((distributionProfile: KalturaDistributionProfile) => {
                                    items.push({value : distributionProfile.id, name : distributionProfile.name});
                                });
                            }

                            // build flavors filter
                            if (responses[2].result.objects.length > 0) {
                                defaultFilterGroup.filtersTypes.push({
                                    type: 'flavors',
                                    caption: 'Flavors'
                                });
                                const items = filters.filtersByType['flavors'] = [];
                                responses[2].result.objects.forEach((flavor: KalturaFlavorParams) => {
                                    items.push({value: flavor.id, name: flavor.name});
                                });
                            }

                            // build acces control profile filter
                            if (responses[3].result.objects.length > 0) {
                                defaultFilterGroup.filtersTypes.push({
                                    type: 'accessControlProfiles',
                                    caption: 'Access Control Profiles'
                                });
                                const items = filters.filtersByType['accessControlProfiles'] = [];
                                responses[3].result.objects.forEach((accessControlProfile: KalturaAccessControlProfile) => {
                                    items.push({
                                        value: accessControlProfile.id,
                                        name: accessControlProfile.name
                                    });
                                });
                            }

                            // build metadata profile filters
                            this.createMetadataProfileFilters(responses[0].result.objects);

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

    createMetadataProfileFilters(metadataProfiles: KalturaMetadataProfile[]){
        try {
            // for each metadata profile, parse its XSD and see if it has a searchable list in it
            metadataProfiles.forEach((metadataProfile) => {
                const xsd = metadataProfile.xsd ? metadataProfile.xsd : null; // try to get the xsd schema from the metadata profile
                if (xsd) {
                    const parser = new DOMParser();
                    const ns = "http://www.w3.org/2001/XMLSchema";
                    const schema = parser.parseFromString(xsd, "text/xml");      // create an xml documents from the schema
                    const elements = schema.getElementsByTagNameNS(ns, "element");    // get all element nodes

                    // for each xsd element with an ID attribute - search for a simpleType node of type listType - this means we have to add it to the filters if it is searchable
                    for (let i = 0; i < elements.length; i++) {
                        const currentNode = elements[i];
                        if (currentNode.getAttribute("id") !== null) {            // only elements with ID attribue can be used for filters
                            const simpleTypes = currentNode.getElementsByTagNameNS(ns, "simpleType");
                            if (simpleTypes.length > 0) {
                                // check if this element is searchable
                                if (currentNode.getElementsByTagName("searchable").length && currentNode.getElementsByTagName("searchable")[0].textContent === "true") {
                                    // check if the simpleType type is "listType"
                                    if (simpleTypes[0].getElementsByTagNameNS(ns, "restriction").length && simpleTypes[0].getElementsByTagNameNS(ns, "restriction")[0].getAttribute("base") === "listType") {
                                        // get filter properties and add it to the metadata profile filters list
                                        const filterLabel = currentNode.getElementsByTagNameNS(ns, "appinfo").length ? currentNode.getElementsByTagNameNS(ns,"appinfo")[0].getElementsByTagName("label")[0].textContent : "";
                                        const valueNodes = simpleTypes[0].getElementsByTagNameNS(ns, "enumeration");
                                        const values = [];
                                        for (let j = 0; j < valueNodes.length; j++) {
                                            values.push(valueNodes[j].getAttribute("value"));
                                        }
                                        const fieldName = currentNode.getAttribute("name");
                                        this.addMetadataProfileFilter(metadataProfile.id, metadataProfile.name, filterLabel, fieldName, values);
                                    }
                                }
                            }
                        }
                    }
                }
            });

        }catch(e){
            // TODO [kmc] handle error
            console.log("An error occured during the metadata profile filters creation process.");
        }
    }

    addMetadataProfileFilter(metadataProfileID, metadataProfileName, filterName, fieldName, values){
        // check if current filter group (accordion header) already exists. If not - create a new one
        let filterGroup: MetadataProfileFilterGroup = R.find(R.propEq('label', metadataProfileName))(this.metadataFilters);
        if (typeof filterGroup === "undefined"){
            filterGroup = {label: metadataProfileName, filters: []};
            this.metadataFilters.push(filterGroup);
        }
        // if the filter does not exist in the filters group yet - add it to the group
        if (typeof R.find(R.propEq('label', filterName))(filterGroup.filters) === "undefined") {
            let newFilter: AdditionalFilter = new MetadataFilter(filterName, "", filterName);
            for (let i = 0; i < values.length; i++){
                newFilter.children.push(new MetadataFilter(fieldName, metadataProfileID, values[i]));
            }
            filterGroup.filters.push(newFilter);
        }
    }

}

