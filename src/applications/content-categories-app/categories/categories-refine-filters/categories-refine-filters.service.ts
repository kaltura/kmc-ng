import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/forkJoin';

import {KalturaClient, KalturaMultiRequest, KalturaMultiResponse} from 'kaltura-ngx-client';
import {DistributionProfileListAction} from 'kaltura-ngx-client/api/types/DistributionProfileListAction';
import {AccessControlListAction} from 'kaltura-ngx-client/api/types/AccessControlListAction';
import {
  FlavoursStore,
  MetadataItemTypes,
  MetadataProfile,
  MetadataProfileCreateModes,
  MetadataProfileStore,
  MetadataProfileTypes
} from 'app-shared/kmc-shared';

import {KalturaAccessControlFilter} from 'kaltura-ngx-client/api/types/KalturaAccessControlFilter';
import {KalturaDetachedResponseProfile} from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import {KalturaFilterPager} from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import {KalturaResponseProfileType} from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';

import {DefaultFiltersList} from './default-filters-list';

import * as R from 'ramda';

export interface RefineGroupListItem {
  value: string,
  label: string
}

export class RefineGroupList {
  public items: RefineGroupListItem[] = [];

  constructor(public name: string,
              public label: string,
              public group?: string) {
  }
}

export interface RefineGroup {
  label: string;
  lists: RefineGroupList[];
}

@Injectable()
export class CategoriesRefineFiltersService {

  private _getRefineFilters$: Observable<RefineGroup[]>;

  constructor(private kalturaServerClient: KalturaClient,
              private _metadataProfileStore: MetadataProfileStore, private _flavoursStore: FlavoursStore) {
  }

  public getFilters(): Observable<RefineGroup[]> {

    if (!this._getRefineFilters$) {
      // execute the request
      const getMetadata$ = this._metadataProfileStore.get({
        type: MetadataProfileTypes.Category,
        ignoredCreateMode: MetadataProfileCreateModes.App
      });
      const otherData$ = this.buildQueryRequest();
      const getFlavours$ = this._flavoursStore.get();
      this._getRefineFilters$ = Observable.forkJoin(getMetadata$, otherData$, getFlavours$)
        .map(
          (responses) => {
            if (responses[1].hasErrors()) {
              throw new Error('failed to load refine filters');
            } else {
              const metadataData = this._buildMetadataFiltersGroups(responses[0].items);
              const defaultFilterGroup = this._buildDefaultFiltersGroup();

              return [defaultFilterGroup, ...metadataData.groups];
            }
          })
        .catch(err => {
          console.log(`log: [warn] [categories-refine-filters] failed to create refine filters: ${err}`);
          this._getRefineFilters$ = null;
          return Observable.throw(err);
        })
        .publishReplay(1)
        .refCount();
    }

    return this._getRefineFilters$;
  }

  private _buildMetadataFiltersGroups(metadataProfiles: MetadataProfile[]): { metadataProfiles: number[], groups: RefineGroup[] } {

    const result: { metadataProfiles: number[], groups: RefineGroup[] } = {metadataProfiles: [], groups: []};

    metadataProfiles.forEach(metadataProfile => {
      result.metadataProfiles.push(metadataProfile.id);

      // get only fields that are list, searchable and has values
      const profileLists = R.filter(field => {
        return (field.type === MetadataItemTypes.List && field.isSearchable && field.optionalValues.length > 0);
      }, metadataProfile.items);

      // if found relevant lists, create a group for that profile
      if (profileLists && profileLists.length > 0) {
        const filterGroup = {label: metadataProfile.name, lists: []};
        result.groups.push(filterGroup);


        profileLists.forEach(list => {
          const group = new RefineGroupList(
            list.id,
            list.label,
            'customMetadata');

          filterGroup.lists.push(group);

          list.optionalValues.forEach(item => {
            group.items.push({
              value: item.value,
              label: item.text
            })

          });
        });
      }
    });

    return result;
  }

  private _buildDefaultFiltersGroup(): RefineGroup {
    const result: RefineGroup = {label: '', lists: []};

    // build constant filters
    DefaultFiltersList.forEach((defaultFilterList) => {
      const newRefineFilter = new RefineGroupList(
        defaultFilterList.name,
        defaultFilterList.label
      );
      result.lists.push(newRefineFilter);
      defaultFilterList.items.forEach((item: any) => {
        newRefineFilter.items.push({value: item.value, label: item.label});
      });

    });

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
        new DistributionProfileListAction({pager: distributionProfilePager}),
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
