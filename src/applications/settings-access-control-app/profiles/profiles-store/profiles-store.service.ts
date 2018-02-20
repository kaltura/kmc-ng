import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { KalturaClient, KalturaMultiRequest } from 'kaltura-ngx-client';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { FiltersStoreBase, NumberTypeAdapter, TypeAdaptersMapping } from '@kaltura-ng/mc-shared/filters';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { StringTypeAdapter } from '@kaltura-ng/mc-shared/filters/filter-types/string-type';
import { SortDirection } from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { KalturaAccessControlFilter } from 'kaltura-ngx-client/api/types/KalturaAccessControlFilter';
import { AccessControlListAction } from 'kaltura-ngx-client/api/types/AccessControlListAction';
import { KalturaLimitFlavorsRestriction } from 'kaltura-ngx-client/api/types/KalturaLimitFlavorsRestriction';
import { KalturaSiteRestriction } from 'kaltura-ngx-client/api/types/KalturaSiteRestriction';
import { KalturaCountryRestriction } from 'kaltura-ngx-client/api/types/KalturaCountryRestriction';
import { KalturaIpAddressRestriction } from 'kaltura-ngx-client/api/types/KalturaIpAddressRestriction';
import { KalturaSessionRestriction } from 'kaltura-ngx-client/api/types/KalturaSessionRestriction';
import { KalturaSiteRestrictionType } from 'kaltura-ngx-client/api/types/KalturaSiteRestrictionType';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { KalturaCountryRestrictionType } from 'kaltura-ngx-client/api/types/KalturaCountryRestrictionType';
import { KalturaIpAddressRestrictionType } from 'kaltura-ngx-client/api/types/KalturaIpAddressRestrictionType';
import { KalturaLimitFlavorsRestrictionType } from 'kaltura-ngx-client/api/types/KalturaLimitFlavorsRestrictionType';
import { KalturaPreviewRestriction } from 'kaltura-ngx-client/api/types/KalturaPreviewRestriction';
import { KalturaAccessControl } from 'kaltura-ngx-client/api/types/KalturaAccessControl';
import { AccessControlDeleteAction } from 'kaltura-ngx-client/api/types/AccessControlDeleteAction';
import { KalturaBaseRestriction } from 'kaltura-ngx-client/api/types/KalturaBaseRestriction';
import { KalturaFlavorParams } from 'kaltura-ngx-client/api/types/KalturaFlavorParams';
import { AccessControlUpdateAction } from 'kaltura-ngx-client/api/types/AccessControlUpdateAction';
import { AccessControlAddAction } from 'kaltura-ngx-client/api/types/AccessControlAddAction';
import { FlavoursStore } from '../../../../shared/kmc-shared/flavours';

const localStoragePageSizeKey = 'accessControlProfiles.list.pageSize';

export interface AccessControlProfilesFilters {
  pageSize: number;
  pageIndex: number;
  sortBy: string;
  sortDirection: number;
}

export interface AccessControlProfileRestriction extends KalturaBaseRestriction {
  isAuthorized: boolean;
  details: string[];
  label: string;
}

export interface ExtendedKalturaAccessControl extends KalturaAccessControl {
  domain: AccessControlProfileRestriction;
  countries: AccessControlProfileRestriction;
  ips: AccessControlProfileRestriction;
  flavors: AccessControlProfileRestriction;
  advancedSecurity: {
    isAuthorized: boolean
    details: { preview?: number, secureVideo?: boolean };
    label: string;
  };
}

@Injectable()
export class AccessControlProfilesStore extends FiltersStoreBase<AccessControlProfilesFilters> implements OnDestroy {
  private _profiles = {
    data: new BehaviorSubject<{ items: ExtendedKalturaAccessControl[], totalCount: number }>({ items: [], totalCount: 0 }),
    state: new BehaviorSubject<{ loading: boolean, errorMessage: string }>({ loading: false, errorMessage: null })
  };

  private _isReady = false;
  private _querySubscription: ISubscription;

  public flavors: { label: string, value: string }[] = [];
  public readonly profiles = {
    data$: this._profiles.data.asObservable(),
    state$: this._profiles.state.asObservable(),
    data: () => this._profiles.data.getValue().items
  };


  constructor(private _kalturaServerClient: KalturaClient,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _flavorsStore: FlavoursStore,
              _logger: KalturaLogger) {
    super(_logger);
    this._prepare();
  }

  ngOnDestroy() {
    this._profiles.data.complete();
    this._profiles.state.complete();
  }

  private _prepare(): void {
    if (!this._isReady) {
      this._isReady = true;

      const defaultPageSize = this._browserService.getFromLocalStorage(localStoragePageSizeKey);
      if (defaultPageSize !== null && (defaultPageSize !== this.cloneFilter('pageSize', null))) {
        this.filter({
          pageSize: defaultPageSize
        });
      }

      this._registerToFilterStoreDataChanges();
      this._executeQuery();
    }
  }

  protected _preFilter(updates: Partial<AccessControlProfilesFilters>): Partial<AccessControlProfilesFilters> {
    if (typeof updates.pageIndex === 'undefined') {
      // reset page index to first page everytime filtering the list by any filter that is not page index
      updates.pageIndex = 0;
    }

    return updates;
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
      this._browserService.setInLocalStorage(localStoragePageSizeKey, pageSize);
    }

    this._profiles.state.next({ loading: true, errorMessage: null });
    this._querySubscription = this._buildQueryRequest()
      .cancelOnDestroy(this)
      .subscribe(
        ({ accessControlList, flavorsList }) => {
          this._querySubscription = null;

          this._profiles.state.next({ loading: false, errorMessage: null });
          this._profiles.data.next({
            items: accessControlList.objects,
            totalCount: accessControlList.totalCount
          });
          this.flavors = flavorsList.map(flavor => ({ label: flavor.name, value: String(flavor.id) }));
        },
        error => {
          this._querySubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._profiles.state.next({ loading: false, errorMessage });
        });


  }

  private _buildQueryRequest(): Observable<{ accessControlList: { objects: ExtendedKalturaAccessControl[], totalCount: number }, flavorsList: KalturaFlavorParams[] }> {
    try {
      // create request items
      const filter = new KalturaAccessControlFilter({});
      const data: AccessControlProfilesFilters = this._getFiltersAsReadonly();
      let pager: KalturaFilterPager = null;

      // update the sort by args
      if (data.sortBy) {
        filter.orderBy = `${data.sortDirection === SortDirection.Desc ? '-' : '+'}${data.sortBy}`;
      }

      // update pagination args
      if (data.pageIndex || data.pageSize) {
        pager = new KalturaFilterPager({
          pageSize: data.pageSize,
          pageIndex: data.pageIndex + 1
        });
      }

      // build the request
      return this._kalturaServerClient.request(new AccessControlListAction({ filter, pager }))
        .switchMap(
          () => this._flavorsStore.get(),
          (accessControlList, flavors) => ({ accessControlList, flavors })
        )
        .map(({ accessControlList, flavors }) => {
          return this._mapProfilesResponse(accessControlList, flavors.items);
        });
    } catch (err) {
      return Observable.throw(err);
    }
  }

  private _mapProfilesResponse(accessControlList, flavorsList): any {
    accessControlList.objects.forEach(item => {
      if (item.restrictions && item.restrictions.length) {
        let domains = [];
        let countries = [];
        let ips = [];
        let flavors = [];
        let advancedSecurity = '';

        item.restrictions.forEach(restriction => {
          if (restriction instanceof KalturaSiteRestriction) {
            const details = restriction.siteList.split(',');
            const isAuthorized = restriction.siteRestrictionType === KalturaSiteRestrictionType.allowSiteList;
            const label = isAuthorized
              ? this._appLocalization.get('applications.settings.accessControl.restrictions.authorized', [details.length])
              : this._appLocalization.get('applications.settings.accessControl.restrictions.blocked', [details.length]);

            domains = details;
            item.domain = Object.assign({}, restriction, { label, isAuthorized, details });
          }

          if (restriction instanceof KalturaCountryRestriction) {
            const isAuthorized = restriction.countryRestrictionType === KalturaCountryRestrictionType.allowCountryList;
            const details = restriction.countryList.split(',').map(countryCode => countryCode.toLowerCase());
            const label = isAuthorized
              ? this._appLocalization.get('applications.settings.accessControl.restrictions.authorized', [details.length])
              : this._appLocalization.get('applications.settings.accessControl.restrictions.blocked', [details.length]);

            countries = details;
            item.countries = Object.assign({}, restriction, { label, isAuthorized, details });
          }

          if (restriction instanceof KalturaIpAddressRestriction) {
            const details = restriction.ipAddressList.split(',');
            const isAuthorized = restriction.ipAddressRestrictionType === KalturaIpAddressRestrictionType.allowList;
            const label = isAuthorized
              ? this._appLocalization.get('applications.settings.accessControl.restrictions.authorized', [details.length])
              : this._appLocalization.get('applications.settings.accessControl.restrictions.blocked', [details.length]);

            ips = details;
            item.ips = Object.assign({}, restriction, { label, isAuthorized, details });
          }

          if (restriction instanceof KalturaLimitFlavorsRestriction) {
            const flavorParamsIds = restriction.flavorParamsIds.split(',');
            const isAuthorized = restriction.limitFlavorsRestrictionType === KalturaLimitFlavorsRestrictionType.allowList;
            const label = isAuthorized
              ? this._appLocalization.get('applications.settings.accessControl.restrictions.authorized', [flavorParamsIds.length])
              : this._appLocalization.get('applications.settings.accessControl.restrictions.blocked', [flavorParamsIds.length]);
            const getFlavorNameById = (flavorId) => {
              const relevantFlavor = flavorsList.find(({ id }) => Number(flavorId) === id);
              return relevantFlavor ? relevantFlavor.name : null;
            };
            flavors = flavorParamsIds.map(getFlavorNameById).filter(Boolean);

            item.flavors = Object.assign({}, restriction, { label, isAuthorized, details: flavorParamsIds });
          }

          const advancedSecurityItem = {
            label: '',
            details: {
              preview: 0,
              secureVideo: false
            }
          };

          if (restriction instanceof KalturaSessionRestriction) {
            advancedSecurityItem.label = this._appLocalization.get('applications.settings.accessControl.restrictions.ks');
            advancedSecurityItem.details.secureVideo = true;
          }

          if (restriction instanceof KalturaPreviewRestriction) {
            advancedSecurityItem.label += this._appLocalization.get('applications.settings.accessControl.restrictions.freePreview');
            advancedSecurityItem.details.preview = restriction.previewLength;
            // for expanded panel details
            const len = restriction.previewLength;
            const min = Math.floor(len / 60);
            const sec = len % 60;
            advancedSecurity = this._appLocalization.get(
              'applications.settings.accessControl.restrictions.freePreviewDetails',
              [min, sec]
            );
          }

          item.advancedSecurity = advancedSecurityItem;

          item.details = {
            domains,
            countries,
            ips,
            flavors,
            advancedSecurity
          };
        });
      }
    });

    // put default profile on top of the table if there's default profile in the response
    const defaultProfileIndex = accessControlList.objects.findIndex(profile => profile.isDefault);
    if (defaultProfileIndex !== -1) {
      const defaultProfile = accessControlList.objects.splice(defaultProfileIndex, 1);
      accessControlList.objects.unshift(...defaultProfile);
    }

    return { accessControlList, flavorsList };
  }

  protected _createDefaultFiltersValue(): AccessControlProfilesFilters {
    const pageSize = this._browserService.getFromLocalStorage(localStoragePageSizeKey) || 25;
    return {
      pageSize: pageSize,
      pageIndex: 0,
      sortBy: 'createdAt',
      sortDirection: SortDirection.Desc,
    };
  }

  protected _getTypeAdaptersMapping(): TypeAdaptersMapping<AccessControlProfilesFilters> {
    return {
      pageSize: new NumberTypeAdapter(),
      pageIndex: new NumberTypeAdapter(),
      sortBy: new StringTypeAdapter(),
      sortDirection: new NumberTypeAdapter(),
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

  public deleteProfiles(profiles: KalturaAccessControl[]): Observable<void> {
    const actions = profiles.map(({ id }) => new AccessControlDeleteAction({ id }));
    return this._kalturaServerClient
      .multiRequest(new KalturaMultiRequest(...actions))
      .map((response) => {
        if (response && response.length) {
          const failedResponse = response.find(res => !!res.error);
          if (failedResponse) {
            throw Observable.throw(failedResponse.error);
          }
        }
      });
  }

  public saveProfile(profile: KalturaAccessControl): Observable<void> {
    const saveAction = profile.id
      ? new AccessControlUpdateAction({ id: profile.id, accessControl: profile })
      : new AccessControlAddAction({ accessControl: profile });

    return this._kalturaServerClient.request(saveAction)
      .map(() => {
      });
  }
}

