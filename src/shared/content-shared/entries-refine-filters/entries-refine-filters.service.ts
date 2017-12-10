import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/forkJoin';
import { PrimeTreeNode } from '@kaltura-ng/kaltura-primeng-ui';

import { KalturaClient } from 'kaltura-ngx-client';
import { KalturaMultiRequest, KalturaMultiResponse } from 'kaltura-ngx-client';
import { DistributionProfileListAction } from 'kaltura-ngx-client/api/types/DistributionProfileListAction';
import { AccessControlListAction } from 'kaltura-ngx-client/api/types/AccessControlListAction';
import {
  FlavoursStore,
  MetadataItemTypes,
  MetadataProfile,
  MetadataProfileCreateModes,
  MetadataProfileStore,
  MetadataProfileTypes
} from 'app-shared/kmc-shared';

import { KalturaAccessControlFilter } from 'kaltura-ngx-client/api/types/KalturaAccessControlFilter';
import { KalturaAccessControlProfile } from 'kaltura-ngx-client/api/types/KalturaAccessControlProfile';
import { KalturaDetachedResponseProfile } from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import { KalturaDistributionProfile } from 'kaltura-ngx-client/api/types/KalturaDistributionProfile';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { KalturaFlavorParams } from 'kaltura-ngx-client/api/types/KalturaFlavorParams';
import { KalturaResponseProfileType } from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';

import { DefaultFiltersList } from './default-filters-list';

import * as R from 'ramda';

import { MetadataProfileFilter } from 'app-shared/content-shared/entries-store/filters/metadata-profile-filter';
import { AccessControlProfilesFilter } from 'app-shared/content-shared/entries-store/filters/access-control-profiles-filter';
import { FlavorsFilter } from 'app-shared/content-shared/entries-store/filters/flavors-filter';
import { DistributionsFilter } from 'app-shared/content-shared/entries-store/filters/distributions-filter';

export type UpdateStatus = {
  loading: boolean;
  errorMessage: string;
};

export interface RefineGroupListItem
{ value: string, label: string }

export class RefineGroupList {
  public items: RefineGroupListItem[] = [];

  constructor(public name: string,
              public label: string
              ) {
  }
}

export interface RefineGroup {
  label: string;
  lists: RefineGroupList[];
}

@Injectable()
export class EntriesRefineFiltersService {
  private _groups = new ReplaySubject<RefineGroup[]>(1);
    public groups$ = this._groups.asObservable();

    private _status: BehaviorSubject<UpdateStatus> = new BehaviorSubject<UpdateStatus>({
    loading: false,
    errorMessage: null
  });
  private executeQuerySubscription: ISubscription = null;

  public status$ = this._status.asObservable();


  constructor(private kalturaServerClient: KalturaClient,
              private _metadataProfileStore: MetadataProfileStore, private _flavoursStore: FlavoursStore) {
    this.load();
  }

  public load() {
    // cancel previous requests
    if (this.executeQuerySubscription) {
      this.executeQuerySubscription.unsubscribe();
      this.executeQuerySubscription = null;
    }

    // execute the request
    const getMetadata$ = this._metadataProfileStore.get({
      type: MetadataProfileTypes.Entry,
      ignoredCreateMode: MetadataProfileCreateModes.App
    });
    const otherData$ = this.buildQueryRequest();
    const getFlavours$ = this._flavoursStore.get();
      this._status.next({ loading: true, errorMessage: null });
    this.executeQuerySubscription = Observable.forkJoin(getMetadata$, otherData$, getFlavours$)
      .subscribe(
        (responses) => {
          this.executeQuerySubscription = null;
          if (responses[1].hasErrors()) {
            this._groups.next([]);
            this._status.next({ loading: false, errorMessage: 'failed to load refine filters' });

          } else {
            const metadataData = this._buildMetadataFiltersGroups(responses[0].items);
            const defaultFilterGroup = this._buildDefaultFiltersGroup(responses[1], responses[2].items);

            this._groups.next([defaultFilterGroup, ...metadataData.groups] );
            this._status.next({ loading: false, errorMessage: null });
          }
        },
        (error) => {
          this.executeQuerySubscription = null;

          this._groups.next([]);
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._status.next({ loading: false, errorMessage });
        }
      );
  }

  private _buildMetadataFiltersGroups(metadataProfiles: MetadataProfile[]): { metadataProfiles: number[], groups: RefineGroup[] } {

    const result: { metadataProfiles: number[], groups: RefineGroup[] } = { metadataProfiles: [], groups: [] };

    metadataProfiles.forEach(metadataProfile => {
      result.metadataProfiles.push(metadataProfile.id);

      // get only fields that are list, searchable and has values
      const profileLists = R.filter(field => {
        return (field.type === MetadataItemTypes.List && field.isSearchable && field.optionalValues.length > 0);
      }, metadataProfile.items);

      // if found relevant lists, create a group for that profile
      if (profileLists && profileLists.length > 0) {
        const filterGroup = { label: metadataProfile.name, lists: [] };
        result.groups.push(filterGroup);


        profileLists.forEach(list => {
          const metadataProfileId = metadataProfile.id;
          const fieldPath = ['metadata', list.name];

          // TODO
          // const refineFilter = new RefineFilter(
          //   list.id,
          //   list.label,
          //   MetadataProfileFilter,
          //   filter => {
          //     return filter instanceof MetadataProfileFilter && filter.name === list.id;
          //   },
          //   (node: PrimeTreeNode) => {
          //     if (node.payload && node.payload.filterName) {
          //       return new MetadataProfileFilter(list.id, <any>node.data, metadataProfileId, fieldPath, list.label);
          //     } else {
          //       return null;
          //     }
          //   });
          //
          // filterGroup.filters.push(refineFilter);

          // list.optionalValues.forEach(item => {
          //   refineFilter.items.push({
          //     id: item.value,
          //     name: item.text
          //   })

          //});
        });
      }
    });

    return result;
  }

  private _buildDefaultFiltersGroup(responses: KalturaMultiResponse, flavours: KalturaFlavorParams[]): RefineGroup {
    const result: RefineGroup = { label: '', lists: [] };

    // build constant filters
    DefaultFiltersList.forEach((defaultFilterList) => {
      const newRefineFilter = new RefineGroupList(
        defaultFilterList.name,
        defaultFilterList.label
      );
      result.lists.push(newRefineFilter);
      defaultFilterList.items.forEach((item: any) => {
        newRefineFilter.items.push({ value: item.value, label: item.label });
      });

    });

    // build access control profile filters
      // TODO
    // if (responses[1].result.objects.length > 0) {
    //   const newRefineFilter = new RefineFilter(
    //     'accessControlProfiles',
    //     'Access Control Profiles',
    //     AccessControlProfilesFilter,
    //     filter => {
    //       return filter instanceof AccessControlProfilesFilter;
    //     },
    //     (node: PrimeTreeNode) => {
    //       return new AccessControlProfilesFilter(<string>node.data, node.label);
    //     });
    //   result.filters.push(newRefineFilter);
    //   responses[1].result.objects.forEach((accessControlProfile: KalturaAccessControlProfile) => {
    //     newRefineFilter.items.push({
    //       id: accessControlProfile.id + '',
    //       name: accessControlProfile.name
    //     });
    //   });
    // }

    // build flavors filters
      // TODO
    // if (flavours.length > 0) {
    //   const newRefineFilter = new RefineFilter(
    //     'flavors',
    //     'Flavors',
    //     FlavorsFilter,
    //     filter => {
    //       return filter instanceof FlavorsFilter;
    //     },
    //     (node: PrimeTreeNode) => {
    //       return new FlavorsFilter(<string>node.data, node.label);
    //     });
    //   result.filters.push(newRefineFilter);
    //   flavours.forEach((flavor: KalturaFlavorParams) => {
    //     newRefineFilter.items.push({ id: flavor.id + '', name: flavor.name });
    //   });
    // }

    // build distributions filters
      // TODO
    // if (responses[0].result.objects.length > 0) {
    //   const newRefineFilter = new RefineFilter(
    //     'distributions',
    //     'Destinations',
    //     DistributionsFilter,
    //     filter => {
    //       return filter instanceof DistributionsFilter;
    //     },
    //     (node: PrimeTreeNode) => {
    //       return new DistributionsFilter(<number>node.data, node.label);
    //     });
    //   result.filters.push(newRefineFilter);
    //   responses[0].result.objects.forEach((distributionProfile: KalturaDistributionProfile) => {
    //     newRefineFilter.items.push({ id: distributionProfile.id + '', name: distributionProfile.name });
    //   });
    // }

    return result;
  }


  private buildQueryRequest(): Observable<KalturaMultiResponse> {

    try {
      const accessControlFilter = new KalturaAccessControlFilter({});
      accessControlFilter.orderBy = '-createdAt';

      const distributionProfilePager = new KalturaFilterPager({});
      distributionProfilePager.pageSize = 500;

      const accessControlPager = new KalturaFilterPager({});
      distributionProfilePager.pageSize = 1000;

      const responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
        fields: 'id,name',
        type: KalturaResponseProfileType.includeFields
      });

      const request = new KalturaMultiRequest(
        new DistributionProfileListAction({ pager: distributionProfilePager }),
        new AccessControlListAction({
          pager: accessControlPager,
          filter: accessControlFilter,
          responseProfile
        }),
      );

      return <any>this.kalturaServerClient.multiRequest(request);
    } catch (error) {
      return Observable.throw(error);
    }
  }
}
