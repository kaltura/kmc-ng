import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ReplaySubject} from 'rxjs/ReplaySubject';

import {KalturaServerClient, KalturaMetadataObjectType, KalturaMultiRequest, KalturaMetadataProfile} from '@kaltura-ng2/kaltura-api';
import {FlavorParamsListAction} from '@kaltura-ng2/kaltura-api/services/flavor-params';
import {MetadataProfileListAction} from '@kaltura-ng2/kaltura-api/services/metadata-profile';
import {AccessControlListAction} from '@kaltura-ng2/kaltura-api/services/access-control';
import {DistributionProfileListAction} from '@kaltura-ng2/kaltura-api/services/distribution-profile';

import {
    KalturaAccessControlFilter,
    KalturaAccessControlProfile,
    KalturaDetachedResponseProfile,
    KalturaDistributionProfile,
    KalturaFilterPager,
    KalturaFlavorParams,
    KalturaMetadataProfileCreateMode,
    KalturaMetadataProfileFilter,
    KalturaResponseProfileType,
    KalturaMetadataProfileStatus
} from '@kaltura-ng2/kaltura-api/types'

import {ConstantsFilters} from './constant-filters';

import * as R from 'ramda';

export interface FilterGroup
{
    groupName : string,
    filtersTypes : { type : string, caption : string }[]
    filtersByType : { [key : string] : {id : string, name : string}[]}
}

export interface AdditionalFilters
{
    groups : FilterGroup[];
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

                            const filters : AdditionalFilters = {groups : []};

                            const defaultFilterGroup = {groupName : '', filtersTypes : [], filtersByType : {}};
                            filters.groups.push(defaultFilterGroup);

                            // build constant filters
                            ConstantsFilters.forEach((filter) =>
                            {
                                defaultFilterGroup.filtersTypes.push({ type : filter.type, caption : filter.name});
                                const items = defaultFilterGroup.filtersByType[filter.type] = [];
                                filter.items.forEach((item: any) => {
                                    items.push({id : item.id, name : item.name});
                                });
                            });

                            // build distributions filters
                            if (responses[1].result.objects.length > 0) {
                                defaultFilterGroup.filtersTypes.push({ type : 'distributions', caption : 'Destinations'});
                                const items = defaultFilterGroup.filtersByType['distributions'] = [];
                                responses[1].result.objects.forEach((distributionProfile: KalturaDistributionProfile) => {
                                    items.push({id : distributionProfile.id, name : distributionProfile.name});
                                });
                            }

                            // build flavors filters
                            if (responses[2].result.objects.length > 0) {
                                defaultFilterGroup.filtersTypes.push({
                                    type: 'flavors',
                                    caption: 'Flavors'
                                });
                                const items = defaultFilterGroup.filtersByType['flavors'] = [];
                                responses[2].result.objects.forEach((flavor: KalturaFlavorParams) => {
                                    items.push({id: flavor.id, name: flavor.name});
                                });
                            }

                            // build access control profile filters
                            if (responses[3].result.objects.length > 0) {
                                defaultFilterGroup.filtersTypes.push({
                                    type: 'accessControlProfiles',
                                    caption: 'Access Control Profiles'
                                });
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
                                                filterGroup.filtersTypes.push({type: list.id, caption: list.label});
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

enum MetadataFieldTypes
{
    Text,
    Date,
    Object,
    List,
    Container
}

interface MetadataFieldInfo
{
    documentations? : string;
    label? : string;
    isSearchable? : boolean;
    defaultLabel? : string;
    isTimeControl? : boolean;
    description? : string;
}

interface MetadataProfile
{
    id : number;
    name : string;
    isActive : boolean;
    fields : MetadataProfileField[]

}

interface MetadataProfileField extends MetadataFieldInfo
{
    type : MetadataFieldTypes;
    path : string[];
    optionalValues : string[];
    id : string;
}

class MetadataProfileParser
{
    private getFieldType(element : Element) : MetadataFieldTypes
    {
        let result : MetadataFieldTypes;
        const type : string = element.getAttribute('type');

        switch (type)
        {
            case "textType":
                result = MetadataFieldTypes.Text;
                break;
            case "dateType":
                result = MetadataFieldTypes.Date;
                break;
            case "listType":
                result = MetadataFieldTypes.List;
                break;
            case "objectType":
                result = MetadataFieldTypes.Object;
                break;
            default:

                if (element.children && element.children.length > 0)
                {
                    const firstChild = element.children[0];

                    if (firstChild.localName === 'complexType')
                    {
                        result = MetadataFieldTypes.Container;
                    }else
                    {
                        // for backward compatibility
                        result = MetadataFieldTypes.List;
                    }
                }

                break;
        }

        return result;

    }

    public  parse(kalturaMetadataProfile : KalturaMetadataProfile) : MetadataProfile{
        const result : MetadataProfile = {
            id : kalturaMetadataProfile.id,
            name : kalturaMetadataProfile.name,
            isActive : kalturaMetadataProfile.status === KalturaMetadataProfileStatus.Active,
            fields : []
        };

        if (kalturaMetadataProfile.xsd)
        {
            const parser = new DOMParser();
            const ns = "http://www.w3.org/2001/XMLSchema";
            const xsd = parser.parseFromString(kalturaMetadataProfile.xsd, "text/xml");      // create an xml documents from the schema

            const rootElement = xsd.firstElementChild.firstElementChild; // schema / element
            const rootElementPath = rootElement.getAttribute('name');
            const children = rootElement.firstElementChild.firstElementChild.children; // ComplexType / sequence / elements[]

            if (children && children.length)
            {
                for(let i = 0, length = children.length;i<length;i++)
                {
                    const field = this.extractField(children[i], [rootElementPath]);
                    if (field) {
                        result.fields.push(field);
                    }

                }
            }
        }
        return result;
    }

    private updateFieldInfo(field : MetadataFieldInfo, element : Element) : void
    {
        const infoElements = element.children[0].children;

        if (element && element.children && element.children.length > 0)
        {
            this.forEach(element.children[0].children, infoElement =>
            {
                const childsName = infoElement.localName;

                if (childsName =="documentation") {
                    field.documentations = infoElement.textContent;
                }
                else {
                    this.forEach(infoElement.children, infoProperty =>
                    {
                        switch (infoProperty.localName) {
                            case "label":
                                field.label = infoProperty.textContent;
                            case "key":
                                field.defaultLabel = infoProperty.textContent;
                                break;
                            case "searchable":
                                field.isSearchable = infoProperty.textContent === 'true';
                                break;
                            case "timeControl":
                                field.isTimeControl = infoProperty.textContent === 'true';
                                break;
                            case "description":
                                field.description = infoProperty.textContent;
                                break;
                        }
                    });
                }
            });
        }
    }

    private extractField(element : Element, parentPath : string[]) : MetadataProfileField {
        let result: MetadataProfileField = null;
        const fieldName = element ? element.getAttribute('name') : null;

        if (fieldName) {
            result = {
                type: this.getFieldType(element),
                path: [...parentPath, fieldName],
                optionalValues : [],
                id : element.getAttribute('id')
            };

            this.updateFieldInfo(result, element);

            if (element.children && element.children.length > 1) {
                const dataElement = element.children[1];

                if (dataElement.localName == 'complexType') {
                    // TODO [kmcng] not needed for version 1
                    //if (dataElement.children[0].localName == "sequenceType" && dataElement.children[0].children) {
                    // this.forEach(dataElement.children[0].children, dataProperty =>
                    // {
                    // var nestedField: MetadataFieldVO = fromXSDToField(nestedElement, field.xpath);
                    // // if any of the nested fields are searchable, make the parent field searcheable too
                    // if (nestedField.appearInSearch) {
                    //     field.appearInSearch = true;
                    // }
                    // field.nestedFieldsArray.addItem(nestedField);
                    // });
                    //}
                    //}
                } else if (result.type === MetadataFieldTypes.List && dataElement.children && dataElement.children.length > 0) {
                    this.forEach(dataElement.children[0].children, item => {
                        result.optionalValues.push(item.getAttribute('value'));
                    });
                }
            }
        }

        return result;
    }

    private forEach(collection : HTMLCollection, callback : (element : Element) => void) : void {
        if (callback && collection && collection.length > 0) {
            for(let i = 0, length = collection.length;i<length;i++)
            {
                callback(collection[i]);
            }
        }
    }
}
