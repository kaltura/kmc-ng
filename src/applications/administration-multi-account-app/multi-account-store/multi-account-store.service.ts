import { BrowserService } from 'shared/kmc-shell/providers/browser.service';
import {
    KalturaDropFolderFileFilter,
    KalturaPartner, KalturaPartnerFilter,
    KalturaPartnerListResponse, KalturaPartnerStatus,
    PartnerListAction
} from 'kaltura-ngx-client';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';
import { KalturaFilterPager } from 'kaltura-ngx-client';
import { KalturaClient } from 'kaltura-ngx-client';
import {AppLocalization, ListTypeAdapter, StringTypeAdapter} from '@kaltura-ng/mc-shared';
import { FiltersStoreBase, TypeAdaptersMapping } from '@kaltura-ng/mc-shared';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { globalConfig } from 'config/global';
import { NumberTypeAdapter } from '@kaltura-ng/mc-shared';
import { AdminMultiAccountMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

export enum SortDirection {
  Desc = -1,
  Asc = 1
}

export interface AccountFilters {
  freeText: string;
  pageSize: number;
  pageIndex: number;
  sortBy: string;
  sortDirection: number;
  status: string[];
}

const localStoragePageSizeKey = 'accounts.list.pageSize';

@Injectable()
export class MultiAccountStoreService extends FiltersStoreBase<AccountFilters> implements OnDestroy {


  private _accounts = {
    data: new BehaviorSubject<{ items: KalturaPartner[], totalCount: number }>({ items: [], totalCount: 0 }),
    state: new BehaviorSubject<{ loading: boolean, errorMessage: string }>({ loading: false, errorMessage: null })
  };
  private _isReady = false;
  private _querySubscription: ISubscription;
    private _allStatusesList = [
        KalturaPartnerStatus.active,
        KalturaPartnerStatus.blocked,
        KalturaPartnerStatus.fullBlock
    ].join(',');

  public readonly accounts = { data$: this._accounts.data.asObservable(), state$: this._accounts.state.asObservable() };

  constructor(private _kalturaClient: KalturaClient,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              adminMultiAccountMainViewService: AdminMultiAccountMainViewService,
              _logger: KalturaLogger) {
    super(_logger.subLogger('AccountsStoreService'));
    if (adminMultiAccountMainViewService.isAvailable()) {
        this._prepare();
    }
  }

  ngOnDestroy() {
    this._accounts.data.complete();
    this._accounts.state.complete();
  }

  protected _createDefaultFiltersValue(): AccountFilters {
    const pageSize = this._browserService.getFromLocalStorage(localStoragePageSizeKey) || globalConfig.client.views.tables.defaultPageSize;
    return {
      freeText: '',
      pageSize: pageSize,
      pageIndex: 0,
      sortBy: 'createdAt',
      sortDirection: SortDirection.Desc,
      status: [],
    };
  }

  protected _getTypeAdaptersMapping(): TypeAdaptersMapping<AccountFilters> {
    return {
      freeText: new StringTypeAdapter(),
      pageSize: new NumberTypeAdapter(),
      pageIndex: new NumberTypeAdapter(),
      sortBy: new StringTypeAdapter(),
      sortDirection: new NumberTypeAdapter(),
      status: new ListTypeAdapter<string>()
    };
  }

  protected _preFilter(updates: Partial<AccountFilters>): Partial<AccountFilters> {
    if (typeof updates.pageIndex === 'undefined') {
      // reset page index to first page everytime filtering the list by any filter that is not page index
      updates.pageIndex = 0;
    }

    return updates;
  }

  private _prepare(): void {
    // NOTICE: do not execute here any logic that should run only once.
    // this function will re-run if preparation failed. execute your logic
    // only after the line where we set isReady to true    if (!this._isReady) {

      if (!this._isReady) {
          this._isReady = true;
          this._logger.info(`initiate service`);
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
      .pipe(cancelOnDestroy(this))
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

    this._logger.info(`loading accounts list data`);
    this._accounts.state.next({ loading: true, errorMessage: null });
    this._querySubscription = this._buildQueryRequest()
      .pipe(cancelOnDestroy(this))
      .subscribe(
        response => {
          this._logger.info(`handle success loading accounts list data`);
          this._querySubscription = null;

          this._accounts.state.next({ loading: false, errorMessage: null });

          this._accounts.data.next({
            items: response.objects,
            totalCount: <number>response.totalCount
          });
        },
        error => {
          this._querySubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._logger.info(`handle failed loading accounts list data, show alert`, { errorMessage });
          this._accounts.state.next({ loading: false, errorMessage });
        });
  }

  private _isNameExist(name: string): boolean {
    return this._accounts.data.value.items.find(item => item['name'] === name) !== undefined;
  }

    private _updateFilterWithJoinedList(list: string[], requestFilter: KalturaPartnerFilter, requestFilterProperty: keyof KalturaDropFolderFileFilter): void {
        const value = (list || []).map(item => item).join(',');

        if (value) {
            requestFilter[requestFilterProperty] = value;
        }
    }

  private _buildQueryRequest(): Observable<KalturaPartnerListResponse> {
    try {

      let pager: KalturaFilterPager = null;
      const filter = new KalturaPartnerFilter({});
      const data: AccountFilters = this._getFiltersAsReadonly();

      // update pagination args
      if (data.pageIndex || data.pageSize) {
        pager = new KalturaFilterPager(
          {
            pageSize: data.pageSize,
            pageIndex: data.pageIndex + 1
          }
        );
      }

        // filter 'freeText'
        if (data.freeText) {
            if (/^-{0,1}\d+$/.test(data.freeText)){
                // number - search pid
                filter.idIn = data.freeText;
            } else {
                // string - search account name
                filter.nameMultiLikeOr = data.freeText;
            }

        }

        // filters of joined list
        this._updateFilterWithJoinedList(data.status, filter, 'statusIn');

        // handle default value for statuses
        if (!filter.statusIn) {
            filter.statusIn = this._allStatusesList;
        }


        // update the sort by args
        if (data.sortBy) {
            filter.orderBy = `${data.sortDirection === SortDirection.Desc ? '-' : '+'}${data.sortBy}`;
        }

      // build the request
      return this._kalturaClient.request(
        new PartnerListAction({ filter, pager })
      );
    } catch (err) {
      return Observable.throw(err);
    }

  }

  public deleteAccount(partnerId: number): Observable<void> {
      /*
    if (!role) {
      return Observable.throw(new Error(this._appLocalization.get('applications.administration.roles.errors.cantDeleteRole')));
    }
    if (role.partnerId === 0) {
      return Observable.throw(new Error(this._appLocalization.get('applications.administration.roles.errors.cantDeleteAdminRole')));
    }

    return this._kalturaClient.request(new UserRoleDeleteAction({
      userRoleId: role.id
    }))
      .map(() => {
        return undefined;
      })
      .catch(error => {
        if (error.code === 'ROLE_IS_BEING_USED') {
          error.message = this._appLocalization.get('applications.administration.roles.errors.roleInUse');
        }
        throw error;
      });*/
      alert("delete account for partner "+ partnerId);
      return Observable.of(null);
  }

  public addAccount(partnerId: number): Observable<void> {
      /*
    if (!role) {
      return Observable.throw(new Error('Unable to add role'));
    }
    role.tags = 'kmc';

    return this._kalturaClient.request(new UserRoleAddAction({ userRole: role }))
      .map(() => {
        return;
      });
      */
      alert("create account for partner "+ partnerId);
      return Observable.of(null);
  }

  public reload(): void {
    this._logger.info(`reloading accounts data`);
    if (this._accounts.state.getValue().loading) {
      this._logger.info(`reloading in progress, skip duplicating request`);
      return;
    }

    if (this._isReady) {
      this._executeQuery();
    } else {
      this._prepare();
    }
  }
}

