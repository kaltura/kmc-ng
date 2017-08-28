import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {KalturaUserRoleFilter} from 'kaltura-typescript-client/types/KalturaUserRoleFilter';
import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {ISubscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import {KalturaDetachedResponseProfile} from 'kaltura-typescript-client/types/KalturaDetachedResponseProfile';
import {KalturaFilterPager} from 'kaltura-typescript-client/types/KalturaFilterPager';
import {KalturaResponseProfileType} from 'kaltura-typescript-client/types/KalturaResponseProfileType';
import {KalturaClient} from '@kaltura-ng/kaltura-client';
import {KalturaUserRoleListResponse} from 'kaltura-typescript-client/types/KalturaUserRoleListResponse';
import {KalturaUserRole} from 'kaltura-typescript-client/types/KalturaUserRole';
import {UserRoleListAction} from 'kaltura-typescript-client/types/UserRoleListAction';

export interface UpdateStatus {
  loading: boolean;
  errorMessage: string;
}

export interface Roles {
  items: KalturaUserRole[],
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

@Injectable()
export class RolesService implements OnDestroy {

  private _roles = new BehaviorSubject<Roles>({items: [], totalCount: 0});
  private _state = new BehaviorSubject<UpdateStatus>({loading: false, errorMessage: null});
  private _rolesExecuteSubscription: ISubscription;
  private _queryData = new BehaviorSubject<QueryData>({
    pageIndex: 1,
    pageSize: 50,
    sortBy: 'createdAt',
    sortDirection: SortDirection.Desc,
    fields: 'id,name, createdAt, directSubRolesCount, entriesCount, fullName'
  });

  public state$ = this._state.asObservable();
  public roles$ = this._roles.asObservable();
  public queryData$ = this._queryData.asObservable();

  constructor(private _kalturaClient: KalturaClient,
              private browserService: BrowserService) {
    const defaultPageSize = this.browserService.getFromLocalStorage('roles.list.pageSize');
    if (defaultPageSize !== null) {
      this._updateQueryData({
        pageSize: defaultPageSize
      });
    }
    this.reload(false);
  }

  ngOnDestroy() {
    this._state.complete();
    this._queryData.complete();
    this._roles.complete();
    if (this._rolesExecuteSubscription) {
      this._rolesExecuteSubscription.unsubscribe();
      this._rolesExecuteSubscription = null;
    }
  }

  public reload(force: boolean): void;
  public reload(query: Partial<QueryData>): void;
  public reload(query: boolean | Partial<QueryData>): void {
    const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));

    if (forceReload || this._roles.getValue().totalCount === 0) {
      if (typeof query === 'object') {
        this._updateQueryData(query);
      }
      this._executeQuery();
    }
  }

  private _updateQueryData(partialData: Partial<QueryData>): void {
    const newQueryData = Object.assign({}, this._queryData.getValue(), partialData);
    this._queryData.next(newQueryData);

    if (partialData.pageSize) {
      this.browserService.setInLocalStorage('roles.list.pageSize', partialData.pageSize);
    }
  }

  private _executeQuery(): void {
    // cancel previous requests
    if (this._rolesExecuteSubscription) {
      this._rolesExecuteSubscription.unsubscribe();
    }

    this._state.next({loading: true, errorMessage: null});

    // execute the request
    this._rolesExecuteSubscription = this.buildQueryRequest(this._queryData.getValue()).subscribe(
      response => {
        this._rolesExecuteSubscription = null;

        this._state.next({loading: false, errorMessage: null});

        this._roles.next({
          items: response.objects,
          totalCount: <number>response.totalCount
        });
      },
      error => {
        this._rolesExecuteSubscription = null;
        const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
        this._state.next({loading: false, errorMessage});
      });
  }

  private buildQueryRequest(queryData: QueryData): Observable<KalturaUserRoleListResponse> {
    try {
      const filter: KalturaUserRoleFilter = new KalturaUserRoleFilter({});
      let pagination: KalturaFilterPager = null;
      const responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
        type: KalturaResponseProfileType.includeFields,
        fields: queryData.fields
      });

      // update pagination args
      if (queryData.pageIndex || queryData.pageSize) {
        pagination = new KalturaFilterPager(
          {
            pageSize: queryData.pageSize,
            pageIndex: queryData.pageIndex
          }
        );
      }

      // update the sort by args
      if (queryData.sortBy) {
        filter.orderBy = `${queryData.sortDirection === SortDirection.Desc ? '-' : '+'}${queryData.sortBy}`;
      }

      // build the request
      return <any>this._kalturaClient.request(
        new UserRoleListAction({
          filter,
          pager: pagination,
          responseProfile
        })
      )
    } catch (err) {
      return Observable.throw(err);
    }

  }
}

