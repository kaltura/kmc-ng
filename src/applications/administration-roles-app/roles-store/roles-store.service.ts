import { BrowserService } from 'shared/kmc-shell/providers/browser.service';
import { KalturaUserRoleFilter } from 'kaltura-ngx-client/api/types/KalturaUserRoleFilter';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { KalturaClient, KalturaMultiRequest } from 'kaltura-ngx-client';
import { KalturaUserRoleListResponse } from 'kaltura-ngx-client/api/types/KalturaUserRoleListResponse';
import { KalturaUserRole } from 'kaltura-ngx-client/api/types/KalturaUserRole';
import { UserRoleListAction } from 'kaltura-ngx-client/api/types/UserRoleListAction';
import { KalturaUserRoleStatus } from 'kaltura-ngx-client/api/types/KalturaUserRoleStatus';
import { KalturaUserRoleOrderBy } from 'kaltura-ngx-client/api/types/KalturaUserRoleOrderBy';
import { UserRoleDeleteAction } from 'kaltura-ngx-client/api/types/UserRoleDeleteAction';
import { UserRoleUpdateAction } from 'kaltura-ngx-client/api/types/UserRoleUpdateAction';
import { UserRoleCloneAction } from 'kaltura-ngx-client/api/types/UserRoleCloneAction';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import { UserRoleAddAction } from 'kaltura-ngx-client/api/types/UserRoleAddAction';
import { FiltersStoreBase, TypeAdaptersMapping } from '@kaltura-ng/mc-shared/filters/filters-store-base';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { globalConfig } from 'config/global';
import { NumberTypeAdapter } from '@kaltura-ng/mc-shared/filters/filter-types/number-type';
import { AdminRolesMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { PermissionTreeNodes, PermissionTreeNode } from './permission-tree-nodes';
import { KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';

export enum SortDirection {
  Desc = -1,
  Asc = 1
}

export interface RolesFilters {
  pageSize: number;
  pageIndex: number;
}

const localStoragePageSizeKey = 'roles.list.pageSize';

@Injectable()
export class RolesStoreService extends FiltersStoreBase<RolesFilters> implements OnDestroy {
    static permissionsTree: PermissionTreeNode[] = null;

    private _roles = {
    data: new BehaviorSubject<{ items: KalturaUserRole[], totalCount: number }>({ items: [], totalCount: 0 }),
    state: new BehaviorSubject<{ loading: boolean, errorMessage: string }>({ loading: false, errorMessage: null })
  };
  private _isReady = false;
  private _querySubscription: ISubscription;

  public readonly roles = { data$: this._roles.data.asObservable(), state$: this._roles.state.asObservable() };

  constructor(private _kalturaClient: KalturaClient,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _kmcPermissionsService: KMCPermissionsService,
              adminRolesMainViewService: AdminRolesMainViewService,
              _logger: KalturaLogger) {
    super(_logger.subLogger('RolesStoreService'));
    if (adminRolesMainViewService.isAvailable()) {
        this._prepare();
    }else{
        this._browserService.handleUnpermittedAction(true);
    }

  }

  public getPermissionsTree(): PermissionTreeNode[] {
      const extendRoleTreeNode = (treeNode: PermissionTreeNode) => {
          Object.assign(treeNode, {
              name: this._kmcPermissionsService.getPermissionNameByKey(treeNode.value)
          });

          if (treeNode.items) {
              treeNode.items.forEach(item => extendRoleTreeNode(item));
          }

          return treeNode;
      };

      if (RolesStoreService.permissionsTree === null) {
          RolesStoreService.permissionsTree = PermissionTreeNodes.map(treeNode => extendRoleTreeNode(treeNode));
      }
      return RolesStoreService.permissionsTree;
  }

  ngOnDestroy() {
    this._roles.data.complete();
    this._roles.state.complete();
  }

  protected _createDefaultFiltersValue(): RolesFilters {
    const pageSize = this._browserService.getFromLocalStorage(localStoragePageSizeKey) || globalConfig.client.views.tables.defaultPageSize;
    return {
      pageSize: pageSize,
      pageIndex: 0
    };
  }

  protected _getTypeAdaptersMapping(): TypeAdaptersMapping<RolesFilters> {
    return {
      pageSize: new NumberTypeAdapter(),
      pageIndex: new NumberTypeAdapter()
    };
  }

  protected _preFilter(updates: Partial<RolesFilters>): Partial<RolesFilters> {
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

    this._logger.info(`initiate service`);

    this._roles.state.next({ loading: true, errorMessage: null });

    this._isReady = true;

    this._registerToFilterStoreDataChanges();

    this._executeQuery();
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

    this._logger.info(`loading roles list data`);
    this._roles.state.next({ loading: true, errorMessage: null });
    this._querySubscription = this._buildQueryRequest()
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this._logger.info(`handle success loading roles list data`);
          this._querySubscription = null;

          this._roles.state.next({ loading: false, errorMessage: null });

          this._roles.data.next({
            items: response.objects,
            totalCount: <number>response.totalCount
          });
        },
        error => {
          this._querySubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._logger.info(`handle failed loading roles list data, show alert`, { errorMessage });
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

  private _buildQueryRequest(): Observable<KalturaUserRoleListResponse> {
    try {
      const filter: KalturaUserRoleFilter = new KalturaUserRoleFilter({
        statusEqual: KalturaUserRoleStatus.active,
        orderBy: KalturaUserRoleOrderBy.idAsc.toString(),
        tagsMultiLikeOr: 'kmc'
      });
      let pager: KalturaFilterPager = null;

      const data: RolesFilters = this._getFiltersAsReadonly();

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
      return this._kalturaClient.request(
        new UserRoleListAction({ filter, pager })
      );
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

  public updateRole(id: number, role: KalturaUserRole): Observable<void> {
    if (!role) {
      return Observable.throw(new Error('Unable to update role'));
    }
    if (role.partnerId === 0) {
      return Observable.throw(new Error('Unable to update Administrator role'));
    }

    return this._kalturaClient.request(new UserRoleUpdateAction({
      userRoleId: id,
      userRole: role
    }))
      .map(() => {
        return;
      });

  }

  public addRole(role: KalturaUserRole): Observable<void> {
    if (!role) {
      return Observable.throw(new Error('Unable to add role'));
    }
    role.tags = 'kmc';

    return this._kalturaClient.request(new UserRoleAddAction({ userRole: role }))
      .map(() => {
        return;
      });
  }

  public reload(): void {
    this._logger.info(`reloading roles data`);
    if (this._roles.state.getValue().loading) {
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

