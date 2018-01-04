import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { KalturaClient, KalturaMultiRequest } from 'kaltura-ngx-client';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { FiltersStoreBase, TypeAdaptersMapping } from '@kaltura-ng/mc-shared/filters/filters-store-base';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { NumberTypeAdapter } from '@kaltura-ng/mc-shared/filters/filter-types/number-type';
import { MetadataProfileListAction } from 'kaltura-ngx-client/api/types/MetadataProfileListAction';
import { KalturaMetadataProfileFilter } from 'kaltura-ngx-client/api/types/KalturaMetadataProfileFilter';
import { KalturaMetadataOrderBy } from 'kaltura-ngx-client/api/types/KalturaMetadataOrderBy';
import { KalturaMetadataProfileCreateMode } from 'kaltura-ngx-client/api/types/KalturaMetadataProfileCreateMode';
import { KalturaMetadataObjectType } from 'kaltura-ngx-client/api/types/KalturaMetadataObjectType';
import { KalturaMetadataProfileListResponse } from 'kaltura-ngx-client/api/types/KalturaMetadataProfileListResponse';
import { MetadataProfileParser } from 'app-shared/kmc-shared';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { environment } from 'app-environment';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { MetadataProfileDeleteAction } from 'kaltura-ngx-client/api/types/MetadataProfileDeleteAction';
import { SettingsMetadataProfile } from './settings-metadata-profile.interface';

export interface SchemasFilters {
  pageSize: number,
  pageIndex: number
}

const localStoragePageSizeKey = 'schemas.list.pageSize';

@Injectable()
export class SchemasStore extends FiltersStoreBase<SchemasFilters> implements OnDestroy {
  private _schemas = {
    data: new BehaviorSubject<{ items: SettingsMetadataProfile[], totalCount: number }>({ items: [], totalCount: 0 }),
    state: new BehaviorSubject<{ loading: boolean, errorMessage: string }>({ loading: false, errorMessage: null })
  };
  private _isReady = false;
  private _querySubscription: ISubscription;
  private _metadataProfileParser = new MetadataProfileParser();

  public readonly schemas = {
    data$: this._schemas.data.asObservable(),
    state$: this._schemas.state.asObservable(),
    data: () => this._schemas.data.value
  };

  constructor(private _kalturaServerClient: KalturaClient,
              private _appLocalization: AppLocalization,
              private _appAuth: AppAuthentication,
              private _browserService: BrowserService,
              _logger: KalturaLogger) {
    super(_logger);
    this._prepare();
  }

  ngOnDestroy() {
    this._schemas.data.complete();
    this._schemas.state.complete();
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

    this._schemas.state.next({ loading: true, errorMessage: null });
    this._querySubscription = this._buildQueryRequest()
      .cancelOnDestroy(this)
      .map(({ objects, totalCount }) => {
        objects.forEach((object: SettingsMetadataProfile) => {
          if (!object.createMode || object.createMode === KalturaMetadataProfileCreateMode.kmc) {
            const parsedProfile = this._metadataProfileParser.parse(object);
            object.profileDisabled = !!parsedProfile.error; // disable profile if there's error during parsing
            object.parsedProfile = parsedProfile.profile;

            if (!object.profileDisabled) {
              object.defaultLabel = object.parsedProfile.items.map(({ label }) => label).join(',');

              const protocol = environment.core.kaltura.useHttpsProtocol ? 'https://' : 'http://';
              const domain = environment.core.kaltura.serverEndpoint;
              const apiUrl = environment.modules.settingsMetadata.apiUrl;
              const ks = this._appAuth.appUser.ks;
              const id = object.id;
              object.downloadUrl = `${protocol}${domain}${apiUrl}/ks/${ks}/id/${id}`;
            }
          } else {
            object.profileDisabled = true; // disabled
          }

          const objectType = object.metadataObjectType.toString();
          if (objectType === KalturaMetadataObjectType.entry.toString()) {
            object.applyTo = this._appLocalization.get('applications.settings.metadata.applyTo.entries');
          } else if (objectType === KalturaMetadataObjectType.category.toString()) {
            object.applyTo = this._appLocalization.get('applications.settings.metadata.applyTo.categories');
          } else {
            object.applyTo = objectType;
          }

          object.isNew = false;
        });

        return { objects, totalCount };
      })
      .subscribe(
        response => {
          this._querySubscription = null;

          this._schemas.state.next({ loading: false, errorMessage: null });

          this._schemas.data.next({
            items: <any[]>response.objects,
            totalCount: <number>response.totalCount
          });
        },
        error => {
          this._querySubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._schemas.state.next({ loading: false, errorMessage });
        });
  }

  private _buildQueryRequest(): Observable<KalturaMetadataProfileListResponse> {
    try {
      // default readonly filter
      const filter = new KalturaMetadataProfileFilter({
        orderBy: KalturaMetadataOrderBy.createdAtDesc.toString(),
        createModeNotEqual: KalturaMetadataProfileCreateMode.app,
        metadataObjectTypeIn: [KalturaMetadataObjectType.entry, KalturaMetadataObjectType.category].join(',')
      });
      let pager: KalturaFilterPager = null;

      const data: SchemasFilters = this._getFiltersAsReadonly();

      // update pagination args
      if (data.pageIndex || data.pageSize) {
        pager = new KalturaFilterPager(
          {
            pageSize: data.pageSize,
            pageIndex: data.pageIndex + 1
          }
        );
      }

      // build the request
      return <any>this._kalturaServerClient.request(
        new MetadataProfileListAction({ filter, pager })
      );
    } catch (err) {
      return Observable.throw(err);
    }
  }

  protected _preFilter(updates: Partial<SchemasFilters>): Partial<SchemasFilters> {
    if (typeof updates.pageIndex === 'undefined') {
      // reset page index to first page everytime filtering the list by any filter that is not page index
      updates.pageIndex = 0;
    }

    return updates;
  }

  protected _createDefaultFiltersValue(): SchemasFilters {
    return {
      pageSize: 25,
      pageIndex: 0
    };
  }

  protected _getTypeAdaptersMapping(): TypeAdaptersMapping<SchemasFilters> {
    return {
      pageSize: new NumberTypeAdapter(),
      pageIndex: new NumberTypeAdapter()
    };
  }

  public reload(): void {
    if (this._schemas.state.getValue().loading) {
      return;
    }

    if (this._isReady) {
      this._executeQuery();
    } else {
      this._prepare();
    }
  }

  public deleteProfiles(profiles: SettingsMetadataProfile[]): Observable<void> {
    const request = new KalturaMultiRequest(
      ...profiles.map(profile => new MetadataProfileDeleteAction({ id: profile.id }))
    );
    return this._kalturaServerClient.multiRequest(request)
      .map(() => {
      });
  }

}

