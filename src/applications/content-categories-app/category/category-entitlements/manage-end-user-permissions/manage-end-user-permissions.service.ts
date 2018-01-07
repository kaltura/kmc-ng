import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {ISubscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import {KalturaDetachedResponseProfile} from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import {KalturaFilterPager} from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import {KalturaResponseProfileType} from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';
import {KalturaClient, KalturaMultiRequest} from 'kaltura-ngx-client';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {KalturaUser} from 'kaltura-ngx-client/api/types/KalturaUser';
import {CategoryUserDeleteAction} from 'kaltura-ngx-client/api/types/CategoryUserDeleteAction';
import {CategoryUserListAction} from 'kaltura-ngx-client/api/types/CategoryUserListAction';
import {KalturaCategoryUserFilter} from 'kaltura-ngx-client/api/types/KalturaCategoryUserFilter';
import {UserGetAction} from 'kaltura-ngx-client/api/types/UserGetAction';
import {KalturaCategoryUserListResponse} from 'kaltura-ngx-client/api/types/KalturaCategoryUserListResponse';
import {KalturaCategoryUser} from 'kaltura-ngx-client/api/types/KalturaCategoryUser';
import {CategoryEntitlementsWidget} from '../category-entitlements-widget.service';
import {KalturaCategoryUserPermissionLevel} from 'kaltura-ngx-client/api/types/KalturaCategoryUserPermissionLevel';
import {KalturaCategoryUserStatus} from 'kaltura-ngx-client/api/types/KalturaCategoryUserStatus';
import {KalturaUpdateMethodType} from 'kaltura-ngx-client/api/types/KalturaUpdateMethodType';
import {CategoryUserActivateAction} from 'kaltura-ngx-client/api/types/CategoryUserActivateAction';
import {CategoryUserDeactivateAction} from 'kaltura-ngx-client/api/types/CategoryUserDeactivateAction';
import {CategoryUserUpdateAction} from 'kaltura-ngx-client/api/types/CategoryUserUpdateAction';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {
  FiltersStoreBase,
  ListAdapter,
  ListType,
  NumberTypeAdapter,
  StringTypeAdapter,
  TypeAdaptersMapping
} from '@kaltura-ng/mc-shared/filters';
import {KalturaSearchOperator} from 'kaltura-ngx-client/api/types/KalturaSearchOperator';
import {KalturaSearchOperatorType} from 'kaltura-ngx-client/api/types/KalturaSearchOperatorType';

export interface LoadingStatus {
  loading: boolean;
  errorMessage: string;
}

export interface User {
  id: string,
  name: string, // User Name / ID
  permissionLevel: KalturaCategoryUserPermissionLevel; // Permission Level
  status: KalturaCategoryUserStatus; // Active
  updateMethod: KalturaUpdateMethodType; // Update Method
  updatedAt: Date; // Updated On
}

export interface Users {
  items: User[],
  totalCount: number
}

export interface UsersFilters {
  freetext: string,
  pageSize: number,
  pageIndex: number,
  permissionLevels: ListType,
  status: ListType,
  updateMethod: ListType,
}


@Injectable()
export class ManageEndUserPermissionsService extends FiltersStoreBase<UsersFilters> implements OnDestroy {

  public usersTotalCount = null;
  private _users = {
    data: new BehaviorSubject<Users>({items: [], totalCount: 0}),
    state: new BehaviorSubject<LoadingStatus>({loading: false, errorMessage: null})
  };

  public readonly users =
    {
      data$: this._users.data.asObservable(),
      state$: this._users.state.asObservable(),
      data: () => {
        return this._users.data.getValue().items;
      }
    };


  private _isReady = false;
  private _querySubscription: ISubscription;
  public queryRequest$: Observable<Users>;
  private readonly _pageSizeCacheKey = 'categories.list.pageSize';
  private _categoryId: number = null;

  constructor(private _kalturaClient: KalturaClient,
              private browserService: BrowserService,
              private _widgetService: CategoryEntitlementsWidget,
              private _appLocalization: AppLocalization,
              _logger: KalturaLogger) {
    super(_logger);
    this.queryRequest$ = this.buildQueryRequest();
  }


  private _prepare(): void {
    if (!this._isReady) {
      this._users.state.next({loading: true, errorMessage: null});

      const defaultPageSize = this.browserService.getFromLocalStorage(this._pageSizeCacheKey);
      if (defaultPageSize !== null) {
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


  ngOnDestroy() {
    this._users.state.complete();
    this._users.data.complete();
  }

  set categoryId(categoryId: number) {
    if (categoryId) {
      this._categoryId = categoryId;
      this.reload();
    }
  }

  get categoryId() {
    return this._categoryId;
  }

  public reload(): void {
    if (this._users.state.getValue().loading) {
      return;
    }

    if (this._isReady) {
      this._executeQuery();
    } else {
      this._prepare();
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

    this._querySubscription = this.buildQueryRequest()
      .cancelOnDestroy(this)
      .subscribe(response => {
          this._querySubscription = null;

          this._users.state.next({loading: false, errorMessage: null});

          this._users.data.next({
            items: response.items,
            totalCount: response.totalCount
          });

          this._widgetService.membersTotalCount = response.totalCount;
          this._categoryId = this._widgetService.data.id;
          this._isReady = true;
        },
        error => {
          this._querySubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._users.state.next({loading: false, errorMessage});
        });

    this._users.state.next({loading: true, errorMessage: null});
  }


  private buildQueryRequest(): Observable<Users> {
    try {

      // create request items
      if (!this._categoryId) {
        return Observable.throw(new Error('ManageEndUserPermissionsService: Category has no end-users'));
      }

      const filter: KalturaCategoryUserFilter = new KalturaCategoryUserFilter({
        categoryIdEqual: this._categoryId
      });

      let pagination: KalturaFilterPager = null;
      // update desired fields of entries
      const responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
        type: KalturaResponseProfileType.includeFields,
        fields: 'userId,permissionLevel,status,updateMethod,updatedAt'
      });

      const advancedSearch = filter.advancedSearch = new KalturaSearchOperator({});
      advancedSearch.type = KalturaSearchOperatorType.searchAnd;

      const data: UsersFilters = this._getFiltersAsReadonly();

      // filter 'freeText'
      if (data.freetext) {
        filter.freeText = data.freetext;
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

      // filter 'status'
      if (data.status && data.status.length > 0) {
        filter.statusIn = data.status.map(e => e.value).join(',');
      }

      // filter 'updateMethod'
      if (data.updateMethod && data.updateMethod.length > 0) {
        filter.updateMethodIn = data.updateMethod.map(e => e.value).join(',');
      }

      // filter 'permissionLevels'
      if (data.permissionLevels && data.permissionLevels.length > 0) {
        filter.permissionLevelIn = data.permissionLevels.map(e => e.value).join(',');
      }

      // remove advanced search arg if it is empty
      if (advancedSearch.items && advancedSearch.items.length === 0) {
        delete filter.advancedSearch;
      }

      return this._kalturaClient.request(
        new CategoryUserListAction({
          filter,
          pager: pagination,
          responseProfile
        }))
        .monitor('ManageEndUserPermissionsService: get Category users')
        .switchMap((result: KalturaCategoryUserListResponse) => (this._getKalturaUsers(result.objects, result.totalCount)))
        .catch(error => {
          return Observable.throw(error);
        });
    } catch (err) {
      return Observable.throw(err);
    }
  }

  private _getKalturaUsers(categoryUsers: KalturaCategoryUser[], totalCount: number): Observable<Users> {
    if (!categoryUsers) {
      return Observable.throw(new Error('ManageEndUserPermissionsService: Category has no end-users'))
    }
    if (!categoryUsers.length) {
      return Observable.of({items: [], totalCount: 0});
    }
    const multiRequest = new KalturaMultiRequest();
    categoryUsers.forEach(user => {
      multiRequest.requests.push(new UserGetAction({
          userId: user.userId,
        })
      );
    });

    return this._kalturaClient.multiRequest(multiRequest)
      .monitor('ManageEndUserPermissionsService: get Kaltura Users for Category Users')
      .map(
        data => {
          if (data.hasErrors()) {
            return Observable.throw(new Error('ManageEndUserPermissionsService: error occurred while trying to buildQueryRequest'));
          }
          const kalturaUsers = data.map(response => (response.result)).filter(result => (result instanceof KalturaUser));
          const users: User[] = categoryUsers.map(categoryUser => ({
            id: categoryUser.userId,
            name: null,
            permissionLevel: categoryUser.permissionLevel,
            status: categoryUser.status,
            updateMethod: categoryUser.updateMethod,
            updatedAt: categoryUser.updatedAt
          }));
          categoryUsers.forEach(cu => {
            kalturaUsers.forEach((kUsr, i) => {
              if (cu.userId === kUsr.id) {
                users[i].name = kUsr.screenName || kUsr.id;
              }
            })
          });
          return {items: users, totalCount};
        })
      .catch(error => {
        return Observable.throw(error);
      });
  }

  public activateUsers(usersIds: string[]): Observable<void> {
    if (!usersIds || !usersIds.length) {
      return Observable.throw('Unable to activate users');
    }

    const multiRequest = new KalturaMultiRequest();
    usersIds.forEach(userId => {
      multiRequest.requests.push(new CategoryUserActivateAction({categoryId: this.categoryId, userId: userId}));
    });

    return this._kalturaClient.multiRequest(multiRequest)
      .map(response => {
          if (response.hasErrors()) {
            throw new Error(
              this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.errors.activateUsers'));
          }
          return undefined;
        }
      )
      .catch(err => Observable.throw(err));
  }

  public deactivateUsers(usersIds: string[]): Observable<void> {
    if (!usersIds || !usersIds.length) {
      return Observable.throw('Unable to deactivate users');
    }

    const multiRequest = new KalturaMultiRequest();
    usersIds.forEach(userId => {
      multiRequest.requests.push(new CategoryUserDeactivateAction({categoryId: this.categoryId, userId}));
    });

    return this._kalturaClient.multiRequest(multiRequest)
      .map(response => {
          if (response.hasErrors()) {
            throw new Error(
              this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.errors.deactivateUsers'));
          }
          return undefined;
        }
      )
      .catch(err => Observable.throw(err));
  }

  public deleteUsers(usersIds: string[]): Observable<void> {
    if (!usersIds || !usersIds.length) {
      return Observable.throw('Unable to delete users');
    }

    const multiRequest = new KalturaMultiRequest();
    usersIds.forEach(userId => {
      multiRequest.requests.push(new CategoryUserDeleteAction({categoryId: this.categoryId, userId: userId}));
    });

    return this._kalturaClient.multiRequest(multiRequest)
      .map(response => {
          if (response.hasErrors()) {
            throw new Error(
              this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.errors.deleteUsers'));
          }
          return undefined;
        }
      )
      .catch(err => Observable.throw(err));
  }

  public setPermissionLevel(usersId: string[], permissionLevel: KalturaCategoryUserPermissionLevel): Observable<void> {
    if (!usersId || !usersId.length || typeof permissionLevel === 'undefined') {
      return Observable.throw('Unable to set permission level for users');
    }

    const multiRequest = new KalturaMultiRequest();
    usersId.forEach(userId => {
      multiRequest.requests.push(new CategoryUserUpdateAction({
        categoryId: this.categoryId,
        userId: userId,
        categoryUser: new KalturaCategoryUser({
          permissionLevel: permissionLevel,
          permissionNames: this._getPermissionsForPermissionLevel(permissionLevel)
        }),
        override: true
      }));
    });

    return this._kalturaClient.multiRequest(multiRequest)
      .map(response => {
          if (response.hasErrors()) {
            throw new Error(
              this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.errors.setPermissionLevel'));
          }
          return undefined;
        }
      )
      .catch(err => Observable.throw(err));
  }

  public setUpdateMethod(usersIds: string[], updateMethod: KalturaUpdateMethodType): Observable<void> {
    if (!usersIds || !usersIds.length || typeof updateMethod === 'undefined') {
      return Observable.throw('Unable to set update method for users');
    }


    const multiRequest = new KalturaMultiRequest();
    usersIds.forEach(userId => {
      multiRequest.requests.push(new CategoryUserUpdateAction({
        categoryId: this.categoryId,
        userId: userId,
        categoryUser: new KalturaCategoryUser({
          updateMethod: updateMethod
        }),
        override: true
      }));
    });

    return this._kalturaClient.multiRequest(multiRequest)
      .map(response => {
          if (response.hasErrors()) {
            throw new Error(
              this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.errors.setUpdateMethod'));
          }
          return undefined;
        }
      )
      .catch(err => Observable.throw(err));
  }

  private _getPermissionsForPermissionLevel(permissionLevel: KalturaCategoryUserPermissionLevel) {
    let result: string;
    switch (permissionLevel) {
      case KalturaCategoryUserPermissionLevel.member:
        result = 'CATEGORY_VIEW';
        break;
      case KalturaCategoryUserPermissionLevel.contributor:
        result = 'CATEGORY_CONTRIBUTE,CATEGORY_VIEW';
        break;
      case KalturaCategoryUserPermissionLevel.moderator:
        result = 'CATEGORY_MODERATE,CATEGORY_CONTRIBUTE,CATEGORY_VIEW';
        break;
      case KalturaCategoryUserPermissionLevel.manager:
        result = 'CATEGORY_EDIT,CATEGORY_MODERATE,CATEGORY_CONTRIBUTE,CATEGORY_VIEW';
        break;
    }
    return result;
  }

  protected _preFilter(updates: Partial<UsersFilters>): Partial<UsersFilters> {
    if (typeof updates.pageIndex === 'undefined') {
      // reset page index to first page everytime filtering the list by any filter that is not page index
      updates.pageIndex = 0;
    }

    return updates;
  }

  protected _createDefaultFiltersValue(): UsersFilters {
    return {
      freetext: '',
      pageSize: 50,
      pageIndex: 0,
      permissionLevels: [],
      status: [],
      updateMethod: []
    };
  }

  protected _getTypeAdaptersMapping(): TypeAdaptersMapping<UsersFilters> {
    return {
      freetext: new StringTypeAdapter(),
      pageSize: new NumberTypeAdapter(),
      pageIndex: new NumberTypeAdapter(),
      permissionLevels: new ListAdapter(),
      status: new ListAdapter(),
      updateMethod: new ListAdapter(),
    };
  }
}

