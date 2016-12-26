import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';

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
    KalturaAccessControlProfile
} from '@kaltura-ng2/kaltura-api/types'

import * as R from 'ramda';

export interface AdditionalFilters {
    items: AdditionalFilter[],
    loaded: boolean,
    status: string
}
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
@Injectable()
export class ContentAdditionalFiltersStore {
    // TODO [KMC] - clear cached data on logout

    private _additionalFilters: BehaviorSubject<AdditionalFilters> = new BehaviorSubject({
        items: [],
        loaded: false,
        status: ''
    });
    public additionalFilters$: Observable<AdditionalFilters> = this._additionalFilters.asObservable();

    private rootLevel: AdditionalFilter[] = [];

    constructor(private kalturaServerClient: KalturaServerClient) {
        this.initRootLevel();
    }

    public reloadAdditionalFilters(ignoreCache: boolean = false): Observable<boolean> {

        const additionalFilters = this._additionalFilters.getValue();

        if (ignoreCache || !additionalFilters.loaded || additionalFilters.status) {

            this._additionalFilters.next({items: [], loaded: false, status: ''});

            const metadataProfilesFilter = new KalturaMetadataProfileFilter();
            metadataProfilesFilter.createModeNotEqual = 3;
            metadataProfilesFilter.orderBy = '-createdAt';
            metadataProfilesFilter.metadataObjectTypeEqual = KalturaMetadataObjectType.User;

            const accessControlFilter = new KalturaAccessControlFilter();
            accessControlFilter.orderBy = '-createdAt';

            const distributionProfilePager = new KalturaFilterPager();
            distributionProfilePager.pageSize = 500;

            const accessControlPager = new KalturaFilterPager();
            distributionProfilePager.pageSize = 1000;

            const responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile();
            responseProfile.setData( data => {
                data.fields = "id,name";
                data.type = KalturaResponseProfileType.IncludeFields;
            });

            return Observable.create(observe => {


                const request = new KalturaMultiRequest(
                    new MetadataProfileListAction({filter: metadataProfilesFilter}),
                    new DistributionProfileListAction({pager: distributionProfilePager}),
                    new FlavorParamsListAction({pager: distributionProfilePager, responseProfile}),
                    new AccessControlListAction({pager: accessControlPager, filter: accessControlFilter, responseProfile}),
                )
                    return this.kalturaServerClient.multiRequest(request)
                    .map((response: any) => {
                        if (response.length){
                          const additionalFiltersData: AdditionalFilter[] = this.buildAdditionalFiltersHyrarchy(response);
                          return additionalFiltersData;
                        }else{
                          return [];
                        }
                    })
                    .subscribe(
                        (filters: AdditionalFilter[]) => {
                            this._additionalFilters.next({
                                items: <AdditionalFilter[]>filters,
                                loaded: true,
                                status: ''
                            });
                            observe.next(true);
                            observe.complete();
                        },
                        () => {
                            // TODO [KMC]: handle error
                            observe.next(false);
                            observe.complete();
                        }
                    )
            });
        } else {
            return Observable.of(true);
        }
    }

    initRootLevel(){
        this.rootLevel = [];
        let newFilter: AdditionalFilter;

        newFilter = new AdditionalFilter('mediaType', '','Media Types');
        newFilter.children.push(new AdditionalFilter('mediaType', '1','Video'));
        newFilter.children.push(new AdditionalFilter('mediaType', '2','Image'));
        newFilter.children.push(new AdditionalFilter('mediaType', '5','Audio'));
        newFilter.children.push(new AdditionalFilter('mediaType', '6','Video Mix'));
        newFilter.children.push(new AdditionalFilter('mediaType', '201','Live Stream'));
        this.rootLevel.push(newFilter);

        newFilter = new AdditionalFilter('ingestionStatus', '','Ingestion Statuses');
        newFilter.children.push(new AdditionalFilter('ingestionStatus', '2','Ready'));
        newFilter.children.push(new AdditionalFilter('ingestionStatus', '7','No Media'));
        newFilter.children.push(new AdditionalFilter('ingestionStatus', '4','Pending'));
        newFilter.children.push(new AdditionalFilter('ingestionStatus', '0','Uploading'));
        newFilter.children.push(new AdditionalFilter('ingestionStatus', '1','Transcoding'));
        newFilter.children.push(new AdditionalFilter('ingestionStatus', '-1,-2','Error'));
        this.rootLevel.push(newFilter);

        newFilter = new AdditionalFilter('durations', '','Durations');
        newFilter.children.push(new AdditionalFilter('durations', 'short','Short (0-4 min.)'));
        newFilter.children.push(new AdditionalFilter('durations', 'medium','Medium (4-20 min.)'));
        newFilter.children.push(new AdditionalFilter('durations', 'long','Long (20+ min.)'));
        this.rootLevel.push(newFilter);

        newFilter = new AdditionalFilter('originalAndClipped', '','Original & Clipped Entries');
        newFilter.children.push(new AdditionalFilter('originalAndClipped', '1','Original Entries'));
        newFilter.children.push(new AdditionalFilter('originalAndClipped', '0','Clipped Entries'));
        this.rootLevel.push(newFilter);

        newFilter = new AdditionalFilter('timeScheduling', '','Time Scheduling');
        newFilter.children.push(new AdditionalFilter('timeScheduling', 'past','Past Scheduling'));
        newFilter.children.push(new AdditionalFilter('timeScheduling', 'live','Live'));
        newFilter.children.push(new AdditionalFilter('timeScheduling', 'future','Future Scheduling'));
        newFilter.children.push(new AdditionalFilter('timeScheduling', 'scheduled','Scheduled'));
        this.rootLevel.push(newFilter);

        newFilter = new AdditionalFilter('moderationStatuses', '','Moderation Statuses');
        newFilter.children.push(new AdditionalFilter('moderationStatuses', '2','Approved'));
        newFilter.children.push(new AdditionalFilter('moderationStatuses', '5','Flagged for review'));
        newFilter.children.push(new AdditionalFilter('moderationStatuses', '6','Rejected'));
        newFilter.children.push(new AdditionalFilter('moderationStatuses', '7','Auto approved'));
        newFilter.children.push(new AdditionalFilter('moderationStatuses', '1','Pending moderation'));
        this.rootLevel.push(newFilter);

        newFilter = new AdditionalFilter('replacementStatuses', '','Replacement Statuses');
        newFilter.children.push(new AdditionalFilter('replacementStatuses', '3,1','Processing new files'));
        newFilter.children.push(new AdditionalFilter('replacementStatuses', '2','Ready for review'));
        this.rootLevel.push(newFilter);
    }


    buildAdditionalFiltersHyrarchy(filters: KalturaResponse<any>[]): AdditionalFilter[] {
        let newFilter: AdditionalFilter;
        filters.forEach((response: KalturaResponse<any>) => {
            if (response.error){
                console.error("Error loading additional filters: "+response.error.message);
            }else{
                if (response.resultType && response.result && response.result.objects && response.result.objects.length) {
                    switch (response.resultType) {
                        case "KalturaFlavorParamsListResponse":
                            newFilter = new AdditionalFilter('flavors', '', 'Flavors');
                            response.result.objects.forEach((flavor: KalturaFlavorParams) => {
                                newFilter.children.push(new AdditionalFilter('flavors', flavor.id.toString(), flavor.name));
                            });
                            this.rootLevel.push(newFilter);
                            break;
                        case "KalturaAccessControlListResponse":
                            newFilter = new AdditionalFilter('accessControlProfiles', '', 'Access Control Profiles');
                            response.result.objects.forEach((accessControlProfile: KalturaAccessControlProfile) => {
                                newFilter.children.push(new AdditionalFilter('accessControlProfiles', accessControlProfile.id.toString(), accessControlProfile.name));
                            });
                            this.rootLevel.push(newFilter);
                            break;
                    }
                }
            }
        })

        return this.rootLevel;
    }

}

