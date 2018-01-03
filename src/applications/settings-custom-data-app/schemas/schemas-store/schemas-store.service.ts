import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { KalturaClient } from 'kaltura-ngx-client';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { KalturaPlaylist } from 'kaltura-ngx-client/api/types/KalturaPlaylist';
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

export interface SchemasFilters {
  pageSize: number,
  pageIndex: number
}

const localStoragePageSizeKey = 'schemas.list.pageSize';

@Injectable()
export class SchemasStore extends FiltersStoreBase<SchemasFilters> implements OnDestroy {
  private _schemas = {
    data: new BehaviorSubject<{ items: KalturaPlaylist[], totalCount: number }>({ items: [], totalCount: 0 }),
    state: new BehaviorSubject<{ loading: boolean, errorMessage: string }>({ loading: false, errorMessage: null })
  };
  private _isReady = false;
  private _querySubscription: ISubscription;

  public readonly schemas = {
    data$: this._schemas.data.asObservable(),
    state$: this._schemas.state.asObservable(),
    data: () => this._schemas.data.value
  };

  constructor(private _kalturaServerClient: KalturaClient,
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
}

