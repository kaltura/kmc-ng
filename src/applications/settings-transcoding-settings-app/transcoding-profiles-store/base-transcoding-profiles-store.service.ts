import { OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { KalturaClient, KalturaMultiRequest } from 'kaltura-ngx-client';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { FiltersStoreBase, TypeAdaptersMapping } from '@kaltura-ng/mc-shared/filters/filters-store-base';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { NumberTypeAdapter } from '@kaltura-ng/mc-shared/filters/filter-types/number-type';
import { KalturaConversionProfileType } from 'kaltura-ngx-client/api/types/KalturaConversionProfileType';
import { KalturaConversionProfileFilter } from 'kaltura-ngx-client/api/types/KalturaConversionProfileFilter';
import { KalturaConversionProfileOrderBy } from 'kaltura-ngx-client/api/types/KalturaConversionProfileOrderBy';
import { ConversionProfileListAction } from 'kaltura-ngx-client/api/types/ConversionProfileListAction';
import { ConversionProfileAssetParamsListAction } from 'kaltura-ngx-client/api/types/ConversionProfileAssetParamsListAction';
import { KalturaConversionProfileAssetParamsFilter } from 'kaltura-ngx-client/api/types/KalturaConversionProfileAssetParamsFilter';
import { KalturaConversionProfileAssetParams } from 'kaltura-ngx-client/api/types/KalturaConversionProfileAssetParams';
import { KalturaConversionProfile } from 'kaltura-ngx-client/api/types/KalturaConversionProfile';
import { FlavoursStore } from 'app-shared/kmc-shared/flavours';
import { KalturaLiveParams } from 'kaltura-ngx-client/api/types/KalturaLiveParams';
import { KalturaFlavorParams } from 'kaltura-ngx-client/api/types/KalturaFlavorParams';
import { StorageProfilesStore } from 'app-shared/kmc-shared/storage-profiles/storage-profiles-store.service';
import { KalturaStorageProfile } from 'kaltura-ngx-client/api/types/KalturaStorageProfile';
import { catchError, map } from 'rxjs/operators';

export enum SortDirection {
  Desc,
  Asc
}

export interface KalturaConversionProfileWithAsset extends KalturaConversionProfile {
  assets: KalturaConversionProfileAssetParams[];
}

export interface TranscodingProfilesFilters {
  pageSize: number;
  pageIndex: number;
}

/**
 * DON'T FORGET to call _prepare function in a child class's constructor!
 */
export abstract class BaseTranscodingProfilesStore extends FiltersStoreBase<TranscodingProfilesFilters> implements OnDestroy {
  private _profiles = {
    data: new BehaviorSubject<{ items: KalturaConversionProfileWithAsset[], totalCount: number }>({ items: [], totalCount: 0 }),
    state: new BehaviorSubject<{ loading: boolean, errorMessage: string }>({ loading: false, errorMessage: null })
  };
  private _flavors = {
    data: new BehaviorSubject<{ media: KalturaFlavorParams[], live: KalturaLiveParams[] }>({ media: [], live: [] }),
    state: new BehaviorSubject<{ loading: boolean, errorMessage: string }>({ loading: false, errorMessage: null })
  };
  private _remoteStorageProfiles = {
    data: new BehaviorSubject<{ items: KalturaStorageProfile[] }>({ items: [] }),
    state: new BehaviorSubject<{ loading: boolean, errorMessage: string }>({ loading: false, errorMessage: null })
  };
  private _isReady = false;
  private _querySubscription: ISubscription;

  protected abstract localStoragePageSizeKey: string;
  protected abstract transcodingProfilesListType: KalturaConversionProfileType;

  public readonly flavors = {
    data$: this._flavors.data.asObservable(),
    state$: this._flavors.state.asObservable(),
    data: () => this._flavors.data.value
  };

  public readonly profiles = {
    data$: this._profiles.data.asObservable(),
    state$: this._profiles.state.asObservable(),
    data: () => this._profiles.data.value
  };

  public readonly remoteStorageProfiles = {
    data$: this._remoteStorageProfiles.data.asObservable(),
    state$: this._remoteStorageProfiles.state.asObservable(),
    data: () => this._remoteStorageProfiles.data.value
  };

  constructor(private _kalturaServerClient: KalturaClient,
              private _browserService: BrowserService,
              private _flavorsStore: FlavoursStore,
              private _storageProfilesStore: StorageProfilesStore,
              _logger: KalturaLogger) {
    super(_logger);
  }

  ngOnDestroy() {
    this._flavors.data.complete();
    this._profiles.data.complete();
    this._remoteStorageProfiles.data.complete();
    this._flavors.state.complete();
    this._profiles.state.complete();
    this._remoteStorageProfiles.state.complete();
  }

  private _registerToFilterStoreDataChanges(): void {
    this.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(() => {
        this._executeQuery();
      });
  }

  private _executeQuery(): void {
    if (this._querySubscription) {
      this._querySubscription.unsubscribe();
      this._querySubscription = null;
    }

    const pageSize = this.cloneFilter('pageSize', null);
    if (pageSize) {
      this._browserService.setInLocalStorage(this.localStoragePageSizeKey, pageSize);
    }

    this._profiles.state.next({ loading: true, errorMessage: null });
    this._querySubscription = this._buildQueryRequest()
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this._querySubscription = null;

          this._profiles.state.next({ loading: false, errorMessage: null });

          this._profiles.data.next({
            items: response.objects,
            totalCount: response.totalCount
          });
        },
        error => {
          this._querySubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._profiles.state.next({ loading: false, errorMessage });
        });
  }

  private _buildQueryRequest(): Observable<{ objects: KalturaConversionProfileWithAsset[], totalCount: number }> {
    try {
      // create request items
      const filter = new KalturaConversionProfileFilter({
        orderBy: KalturaConversionProfileOrderBy.createdAtDesc.toString(),
        typeEqual: this.transcodingProfilesListType
      });
      let pager: KalturaFilterPager = null;

      const data: TranscodingProfilesFilters = this._getFiltersAsReadonly();

      // update pagination args
      if (data.pageIndex || data.pageSize) {
        pager = new KalturaFilterPager(
          {
            pageSize: data.pageSize,
            pageIndex: data.pageIndex + 1
          }
        );
      }

      const conversionProfileAction = new ConversionProfileListAction({ filter, pager });
      const conversionProfileAssetParamsAction = new ConversionProfileAssetParamsListAction({
        filter: new KalturaConversionProfileAssetParamsFilter({ conversionProfileIdFilter: filter }),
        pager: new KalturaFilterPager({ pageSize: 1000 })
      });

      // build the request
      return this._kalturaServerClient
        .multiRequest(new KalturaMultiRequest(conversionProfileAction, conversionProfileAssetParamsAction))
        .pipe(
          map(([profilesResponse, assetsResponse]) => {
            if (profilesResponse.error) {
              throw Error(profilesResponse.error.message);
            }

            if (assetsResponse.error) {
              throw Error(assetsResponse.error.message);
            }

            const profiles = profilesResponse.result.objects;
            const assets = assetsResponse.result.objects;
            const totalCount = profilesResponse.result.totalCount;

            const objects = profiles.map(profile => {
              const relevantAssets = assets.filter(({ conversionProfileId }) => conversionProfileId === profile.id);
              return Object.assign(profile, { assets: relevantAssets });
            });

            // put default profile on top of the table if there's default profile in the response
            const defaultProfileIndex = objects.findIndex(profile => profile.isDefault);
            if (defaultProfileIndex !== -1) {
              const defaultProfile = objects.splice(defaultProfileIndex, 1);
              objects.unshift(...defaultProfile);
            }

            return { objects, totalCount };
          })
        );
    } catch (err) {
      return Observable.throw(err);
    }
  }

  private _loadRemoteStorageProfiles(): void {
    const getEmptyRemoteStorageProfile = () => {
      const emptyProfile = new KalturaStorageProfile({ name: 'N/A' });
      (<any>emptyProfile).id = null;
      return emptyProfile;
    };
    this._remoteStorageProfiles.state.next({ loading: true, errorMessage: null });

    this._storageProfilesStore.get()
      .cancelOnDestroy(this)
      .pipe(
        map(({ items }) => [getEmptyRemoteStorageProfile(), ...items]),
        catchError(() => Observable.of([getEmptyRemoteStorageProfile()]))
      )
      .subscribe(
        (items) => {
          this._remoteStorageProfiles.state.next({ loading: false, errorMessage: null });
          this._remoteStorageProfiles.data.next({ items });
        });
  }

  private _loadFlavors(): void {
    this._flavors.state.next({ loading: true, errorMessage: null });

    this._flavorsStore.get()
      .cancelOnDestroy(this)
      .pipe(
        map(({ items }) => {
          const live = [];
          const media = [];
          items.forEach(flavor => {
            if (flavor instanceof KalturaLiveParams) {
              live.push(flavor);
            } else {
              media.push(flavor);
            }
          });

          return { media, live };
        })
      )
      .subscribe(
        ({ media, live }) => {
          this._flavors.state.next({ loading: false, errorMessage: null });
          this._flavors.data.next({ media, live });
        },
        (error) => {
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._flavors.state.next({ loading: false, errorMessage });
        });
  }

  protected _prepare(): void {
    // NOTICE: do not execute here any logic that should run only once.
    // this function will re-run if preparation failed. execute your logic
    // only after the line where we set isReady to true

    if (!this._isReady) {
      this._isReady = true;

      const defaultPageSize = this._browserService.getFromLocalStorage(this.localStoragePageSizeKey);
      if (defaultPageSize !== null && (defaultPageSize !== this.cloneFilter('pageSize', null))) {
        this.filter({
          pageSize: defaultPageSize
        });
      }

      this._registerToFilterStoreDataChanges();
      this._loadFlavors();
      this._loadRemoteStorageProfiles();
      this._executeQuery();
    }
  }

  protected _preFilter(updates: Partial<TranscodingProfilesFilters>): Partial<TranscodingProfilesFilters> {
    if (typeof updates.pageIndex === 'undefined') {
      // reset page index to first page everytime filtering the list by any filter that is not page index
      updates.pageIndex = 0;
    }

    return updates;
  }

  protected _createDefaultFiltersValue(): TranscodingProfilesFilters {
    const pageSize = this._browserService.getFromLocalStorage(this.localStoragePageSizeKey) || 50;
    return {
      pageSize: pageSize,
      pageIndex: 0,
    };
  }

  protected _getTypeAdaptersMapping(): TypeAdaptersMapping<TranscodingProfilesFilters> {
    return {
      pageSize: new NumberTypeAdapter(),
      pageIndex: new NumberTypeAdapter(),
    };
  }

  public reload(): void {
    if (this._profiles.state.getValue().loading) {
      return;
    }

    if (this._isReady) {
      this._executeQuery();
    } else {
      this._prepare();
    }
  }

  public deleteProfile(id: string): Observable<void> {
    return Observable.empty();
  }
}

