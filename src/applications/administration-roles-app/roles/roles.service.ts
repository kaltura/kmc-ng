import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { KalturaUserRoleFilter } from 'kaltura-ngx-client/api/types/KalturaUserRoleFilter';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { KalturaClient, KalturaMultiRequest } from 'kaltura-ngx-client';
import { KalturaUserRoleListResponse } from 'kaltura-ngx-client/api/types/KalturaUserRoleListResponse';
import { KalturaUserRole } from 'kaltura-ngx-client/api/types/KalturaUserRole';
import { UserRoleListAction } from 'kaltura-ngx-client/api/types/UserRoleListAction';
import { KalturaUserRoleStatus } from 'kaltura-ngx-client/api/types/KalturaUserRoleStatus';
import { KalturaUserRoleOrderBy } from 'kaltura-ngx-client/api/types/KalturaUserRoleOrderBy';
import { UserRoleDeleteAction } from 'kaltura-ngx-client/api/types/UserRoleDeleteAction';
import { UserRoleUpdateAction } from 'kaltura-ngx-client/api/types/UserRoleUpdateAction';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { UserRoleCloneAction } from 'kaltura-ngx-client/api/types/UserRoleCloneAction';

export interface UpdateStatus {
  loading: boolean;
  errorMessage: string;
}

export interface Roles {
  items: KalturaUserRole[],
  totalCount: number
}

export enum SortDirection {
  Desc = -1,
  Asc = 1
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
  private _roles = {
    data: new BehaviorSubject<Roles>({ items: [], totalCount: 0 }),
    state: new BehaviorSubject<UpdateStatus>({ loading: false, errorMessage: null })
  };
  private _rolesExecuteSubscription: ISubscription;
  private _queryData = new BehaviorSubject<QueryData>({
    pageIndex: 0,
    pageSize: 50,
    sortBy: 'id',
    sortDirection: SortDirection.Asc,
    fields: 'id,name, updatedAt, description'
  });

  public readonly roles = { data$: this._roles.data.asObservable(), state$: this._roles.state.asObservable() };
  public queryData$ = this._queryData.asObservable();

  constructor(private _kalturaClient: KalturaClient,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
    const defaultPageSize = this._browserService.getFromLocalStorage('roles.list.pageSize');
    if (defaultPageSize !== null) {
      this._updateQueryData({
        pageSize: defaultPageSize
      });
    }
    this.reload(false);
  }

  ngOnDestroy() {
    this._queryData.complete();
    this._roles.data.complete();
    this._roles.state.complete();
    if (this._rolesExecuteSubscription) {
      this._rolesExecuteSubscription.unsubscribe();
      this._rolesExecuteSubscription = null;
    }
  }

  private _updateQueryData(partialData: Partial<QueryData>): void {
    const newQueryData = Object.assign({}, this._queryData.getValue(), partialData);
    this._queryData.next(newQueryData);

    if (partialData.pageSize) {
      this._browserService.setInLocalStorage('roles.list.pageSize', partialData.pageSize);
    }
  }

  private _executeQuery(): void {
    // cancel previous requests
    if (this._rolesExecuteSubscription) {
      this._rolesExecuteSubscription.unsubscribe();
    }

    this._browserService.scrollToTop();
    this._roles.state.next({ loading: true, errorMessage: null });

    // execute the request
    this._rolesExecuteSubscription = this._buildQueryRequest(this._queryData.getValue()).subscribe(
      response => {
        this._rolesExecuteSubscription = null;

        this._roles.state.next({ loading: false, errorMessage: null });

        this._roles.data.next({
          items: response.objects,
          totalCount: <number>response.totalCount
        });
      },
      error => {
        this._rolesExecuteSubscription = null;
        const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
        this._roles.state.next({ loading: false, errorMessage });
      });
  }


  private _getDuplicatedRole(role: KalturaUserRole) {
    const duplicateName = this._appLocalization.get('applications.administration.roles.copyOf') + ' ' + role.name;
    role.tags = 'kmc';

    const duplicatedRole = new KalturaUserRole();
    duplicatedRole.name = this._isNameExist(duplicateName) ? undefined : duplicateName;
    return duplicatedRole;
  }

  private _isNameExist(name: string): boolean {
    return this._roles.data.value.items.find(item => item['name'] === name) !== undefined;
  }

  private _buildQueryRequest(queryData: QueryData): Observable<KalturaUserRoleListResponse> {
    try {
      const filter: KalturaUserRoleFilter = new KalturaUserRoleFilter({
        statusEqual: KalturaUserRoleStatus.active,
        orderBy: KalturaUserRoleOrderBy.idAsc.toString(),
        tagsMultiLikeOr: 'kmc'
      });
      let pagination: KalturaFilterPager = null;

      // update pagination args
      if (queryData.pageIndex >= 0 || queryData.pageSize) {
        pagination = new KalturaFilterPager(
          {
            pageSize: queryData.pageSize,
            pageIndex: queryData.pageIndex + 1
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
        })
      )
    } catch (err) {
      return Observable.throw(err);
    }

  }

  public deleteRole(role: KalturaUserRole): Observable<void> {
    if (!role) {
      return Observable.throw(new Error(this._appLocalization.get('applications.administration.roles.errors.cantDeleteRole')));
    }
    if (role.partnerId === 0) {
      return Observable.throw(new Error(this._appLocalization.get('applications.administration.roles.errors.cantDeleteAdminRole')));
    }

    return this._kalturaClient.request(new UserRoleDeleteAction({
      userRoleId: role.id
    }))
      .do(() => this.reload(true))
      .map(() => {
        return undefined;
      })
      .catch(error => {
        if (error.code === 'ROLE_IS_BEING_USED') {
          error.message = this._appLocalization.get('applications.administration.roles.errors.roleInUse');
        }
        throw error;
      });
  }

  public duplicateRole(role: KalturaUserRole): Observable<KalturaUserRole> {
    if (!role) {
      return Observable.throw(new Error(this._appLocalization.get('applications.administration.roles.errors.cantDuplicateRole')));
    }

    const multiRequest = new KalturaMultiRequest(
      new UserRoleCloneAction({ userRoleId: role.id }),
      new UserRoleUpdateAction({
        userRoleId: 0,
        userRole: this._getDuplicatedRole(role),
      }).setDependency(['userRoleId', 0, 'id'])
    );

    return this._kalturaClient.multiRequest(multiRequest)
      .map(
        data => {
          if (data.hasErrors()) {
            throw new Error(this._appLocalization.get('applications.administration.roles.errors.duplicationError'));
          }
          return data[1].result;
        })
      .catch(error => {
        throw new Error(this._appLocalization.get('applications.administration.roles.errors.duplicationError'));
      });
  }

  public reload(force: boolean): void;
  public reload(query: Partial<QueryData>): void;
  public reload(query: boolean | Partial<QueryData>): void {
    const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));

    if (forceReload || this._roles.data.value.totalCount === 0) {
      if (typeof query === 'object') {
        this._updateQueryData(query);
      }
      this._executeQuery();
    }
  }
}

