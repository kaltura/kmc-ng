import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {KalturaCategoryFilter} from 'kaltura-ngx-client/api/types/KalturaCategoryFilter';
import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {ISubscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/map';

import {KalturaDetachedResponseProfile} from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import {KalturaFilterPager} from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import {KalturaResponseProfileType} from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';
import {CategoryListAction} from 'kaltura-ngx-client/api/types/CategoryListAction';
import {KalturaClient} from 'kaltura-ngx-client';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {KalturaCategoryListResponse} from 'kaltura-ngx-client/api/types/KalturaCategoryListResponse';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {CategoryDeleteAction} from 'kaltura-ngx-client/api/types/CategoryDeleteAction';
import {
  DatesRangeAdapter,
  DatesRangeType,
  FiltersStoreBase,
  GroupedListAdapter,
  GroupedListType,
  ListAdapter,
  ListType,
  NumberTypeAdapter,
  StringTypeAdapter,
  TypeAdaptersMapping
} from '@kaltura-ng/mc-shared/filters';
import {MetadataProfileCreateModes, MetadataProfileStore, MetadataProfileTypes} from 'app-shared/kmc-shared';
import {KalturaSearchOperator} from 'kaltura-ngx-client/api/types/KalturaSearchOperator';
import {KalturaSearchOperatorType} from 'kaltura-ngx-client/api/types/KalturaSearchOperatorType';
import {KalturaUtils} from '@kaltura-ng/kaltura-common';
import {KalturaMetadataSearchItem} from 'kaltura-ngx-client/api/types/KalturaMetadataSearchItem';
import {KalturaSearchCondition} from 'kaltura-ngx-client/api/types/KalturaSearchCondition';
import {KalturaAppearInListType} from "kaltura-ngx-client/api/types/KalturaAppearInListType";
import {KalturaContributionPolicyType} from "kaltura-ngx-client/api/types/KalturaContributionPolicyType";

export interface UpdateStatus {
  loading: boolean;
  errorMessage: string;
}

export interface Categories {
  items: KalturaCategory[],
  totalCount: number
}

export enum SortDirection {
  Desc,
  Asc
}

export interface QueryData {
  pageIndex: number,
  pageSize: number,
  sortBy: string,
  sortDirection: SortDirection,
  fields: string
}

export interface NewCategoryData {
  parentCategoryId: number;
}

export interface CategoriesFilters {
  freetext: string,
  pageSize: number,
  pageIndex: number,
  sortBy: string,
  sortDirection: number,
  createdAt: DatesRangeType,
  privacyTypes: ListType,
  categoryListing: ListType,
  contributionPolicy: ListType,
  endUserPermissions: ListType,
  customMetadata: GroupedListType
}


@Injectable()
export class CategoriesService extends FiltersStoreBase<CategoriesFilters> implements OnDestroy {

  private _categories = {
    data: new BehaviorSubject<Categories>({items: [], totalCount: 0}),
    state: new BehaviorSubject<UpdateStatus>({loading: false, errorMessage: null})
  };

  public readonly categories =
    {
      data$: this._categories.data.asObservable(),
      state$: this._categories.state.asObservable(),
      data: () => {
        return this._categories.data.getValue().items;
      }
    };

  private _isReady = false;
  private _metadataProfiles: { id: number, name: string, lists: { id: string, name: string }[] }[];
  private _querySubscription: ISubscription;
  private readonly _pageSizeCacheKey = 'categories.list.pageSize';
  private _newCategoryData: NewCategoryData = null;

  constructor(private _kalturaClient: KalturaClient,
              private browserService: BrowserService,
              private metadataProfileService: MetadataProfileStore,
              _logger: KalturaLogger) {
    super(_logger);
    this._prepare();
  }

  private _prepare(): void {
    if (!this._isReady) {
      this._categories.state.next({loading: true, errorMessage: null});
      this.metadataProfileService.get(
        {
          type: MetadataProfileTypes.Category,
          ignoredCreateMode: MetadataProfileCreateModes.App
        })
        .cancelOnDestroy(this)
        .first()
        .monitor('categories.service: get metadata profiles')
        .subscribe(
          metadataProfiles => {
            this._isReady = true;
            this._metadataProfiles = metadataProfiles.items.map(metadataProfile => (
              {
                id: metadataProfile.id,
                name: metadataProfile.name,
                lists: (metadataProfile.items || []).map(item => ({id: item.id, name: item.name}))
              }));

            const defaultPageSize = this.browserService.getFromLocalStorage(this._pageSizeCacheKey);
            if (defaultPageSize !== null) {
              this.filter({
                pageSize: defaultPageSize
              });
            }

            this._registerToFilterStoreDataChanges();
            this._executeQuery();
          },
          (error) => {
            this._categories.state.next({loading: false, errorMessage: error.message});
          }
        );
    }
  }

  private _registerToFilterStoreDataChanges(): void {
    this.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(() => {
        this._executeQuery();
      });

  }


  ngOnDestroy() {

    this._categories.state.complete();
    this._categories.data.complete();
  }


  public reload(): void {
    if (this._categories.state.getValue().loading) {
      return;
    }

    if (this._isReady) {
      this._executeQuery();
    } else {
      this._prepare();
    }
  }

  public getNextCategoryId(categoryId: number): number | null {
    const categories = this._categories.data.getValue().items;
    if (!categories || !categories.length) {
      return null;
    }

    // validate category exists
    const currentCategoryIndex = categories.findIndex(category => category.id === categoryId);
    if (currentCategoryIndex === -1) {
      return null;
    }

    // get next category ID
    if (currentCategoryIndex < categories.length - 1) {
      return (categories[currentCategoryIndex + 1].id);
    } else {
      return null;
    }
  }

  public getPrevCategoryId(categoryId: number): number | null {
    const categories = this._categories.data.getValue().items;
    if (!categories || !categories.length) {
      return null;
    }

    // validate category exists
    const currentCategoryIndex = categories.findIndex(category => category.id === categoryId);
    if (currentCategoryIndex === -1) {
      return null;
    }

    // get previous category ID
    if (currentCategoryIndex !== 0) {
      return (categories[currentCategoryIndex - 1].id);
    } else {
      return null;
    }
  }

  private _executeQuery(): void {

    if (this._querySubscription) {
      this._querySubscription.unsubscribe();
      this._querySubscription = null;
    }

    const pageSize = this.cloneFilter('pageSize', null);
    if (pageSize) {
      this.browserService.setInLocalStorage(this._pageSizeCacheKey, pageSize);
    }

    this._categories.state.next({loading: true, errorMessage: null});
    this._querySubscription = this.buildQueryRequest()
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this._querySubscription = null;

          this._categories.state.next({loading: false, errorMessage: null});

          this._categories.data.next({
            items: response.objects,
            totalCount: <number>response.totalCount
          });
        },
        error => {
          this._querySubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._categories.state.next({loading: false, errorMessage});
        });


  }

  private buildQueryRequest(): Observable<KalturaCategoryListResponse> {
    try {
      // create request items
      const filter: KalturaCategoryFilter = new KalturaCategoryFilter({});
      let pagination: KalturaFilterPager = null;
      // update desired fields of entries
      const responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
        type: KalturaResponseProfileType.includeFields,
        fields: 'id, name, createdAt, directSubCategoriesCount, entriesCount, fullName, tags'
      });

      const advancedSearch = filter.advancedSearch = new KalturaSearchOperator({});
      advancedSearch.type = KalturaSearchOperatorType.searchAnd;

      const data: CategoriesFilters = this._getFiltersAsReadonly();

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

      // filters of custom metadata lists
      if (this._metadataProfiles && this._metadataProfiles.length > 0) {

        this._metadataProfiles.forEach(metadataProfile => {
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

      // filter 'privacyTypes'
      if (data.privacyTypes && data.privacyTypes.length > 0) {
        filter.privacyIn = data.privacyTypes.map(e => e.value).join(',');
      }

      // filter 'categoryListing', set filter if only one option selected
      if (data.categoryListing) {
        if (data.categoryListing.length === 1) {
          switch (data.categoryListing[0].value) {
            case KalturaAppearInListType.categoryMembersOnly.toString():
              filter.appearInListEqual = KalturaAppearInListType.categoryMembersOnly;
              break;
            case KalturaAppearInListType.partnerOnly.toString():
              filter.appearInListEqual = KalturaAppearInListType.partnerOnly;
              break;
            default:
              break
          }
        }
      }

      // filter 'contributionPolicy', set filter if only one option selected
      if (data.contributionPolicy) {
        if (data.contributionPolicy.length === 1) {
          data.contributionPolicy.forEach(item => {
            switch (item.value) {
              case KalturaContributionPolicyType.all.toString():
                filter.contributionPolicyEqual = KalturaContributionPolicyType.all;
                break;
              case KalturaContributionPolicyType.membersWithContributionPermission.toString():
                filter.contributionPolicyEqual = KalturaContributionPolicyType.membersWithContributionPermission;
                break;
              default:
                break
            }
          });
        }
    }

      // filter 'endUserPermissions', set filter if only one option selected
      if (data.endUserPermissions) {
        if (data.endUserPermissions.length === 1) {
          data.endUserPermissions.forEach(item => {
            switch (item.value) {
              case 'has':
                filter.membersCountGreaterThanOrEqual = 1;
                filter.membersCountLessThanOrEqual = undefined;
                break;
              case 'no':
                filter.membersCountLessThanOrEqual = 0;
                filter.membersCountGreaterThanOrEqual = undefined;
                break;
              default:
                break
            }
          });
        }
      }

      // remove advanced search arg if it is empty
      if (advancedSearch.items && advancedSearch.items.length === 0) {
        delete filter.advancedSearch;
      }

      // build the request
      return this._kalturaClient.request(
        new CategoryListAction({
          filter,
          pager: pagination,
          responseProfile
        })
      );
    } catch (err) {
      return Observable.throw(err);
    }

  }

  public deleteCategory(categoryId: number): Observable<void> {

    return Observable.create(observer => {
      let subscription: ISubscription;
      if (categoryId && categoryId > 0) {
        subscription = this._kalturaClient.request(new CategoryDeleteAction({id: categoryId})).subscribe(
          result => {
            observer.next();
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
      } else {
        observer.error(new Error('missing categoryId argument'));
      }
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      }
    });
  }

  public setNewCategoryData(newCategoryData: NewCategoryData) {
    this._newCategoryData = newCategoryData;
  }

  public getNewCategoryData(): NewCategoryData {
    return this._newCategoryData;
  }

  public clearNewCategoryData(): void {
    this._newCategoryData = null
  }

  protected _preFilter(updates: Partial<CategoriesFilters>): Partial<CategoriesFilters> {
    if (typeof updates.pageIndex === 'undefined') {
      // reset page index to first page everytime filtering the list by any filter that is not page index
      updates.pageIndex = 0;
    }

    return updates;
  }

  protected _createDefaultFiltersValue(): CategoriesFilters {
    return {
      freetext: '',
      pageSize: 50,
      pageIndex: 0,
      sortBy: 'createdAt',
      sortDirection: SortDirection.Desc,
      createdAt: {fromDate: null, toDate: null},
      privacyTypes: [],
      categoryListing: [],
      contributionPolicy: [],
      endUserPermissions: [],
      customMetadata: {}
    };
  }

  protected _getTypeAdaptersMapping(): TypeAdaptersMapping<CategoriesFilters> {
    return {
      freetext: new StringTypeAdapter(),
      pageSize: new NumberTypeAdapter(),
      pageIndex: new NumberTypeAdapter(),
      sortBy: new StringTypeAdapter(),
      sortDirection: new NumberTypeAdapter(),
      createdAt: new DatesRangeAdapter(),
      privacyTypes: new ListAdapter(),
      categoryListing: new ListAdapter(),
      contributionPolicy: new ListAdapter(),
      endUserPermissions: new ListAdapter(),
      customMetadata: new GroupedListAdapter()
    };
  }
}

