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
import {KalturaCategoryUser} from 'kaltura-ngx-client/api/types/KalturaCategoryUser';
import {KalturaCategoryUserPermissionLevel} from 'kaltura-ngx-client/api/types/KalturaCategoryUserPermissionLevel';
import {KalturaUpdateMethodType} from 'kaltura-ngx-client/api/types/KalturaUpdateMethodType';
import {CategoryUserActivateAction} from 'kaltura-ngx-client/api/types/CategoryUserActivateAction';
import {CategoryUserDeactivateAction} from 'kaltura-ngx-client/api/types/CategoryUserDeactivateAction';
import {CategoryUserUpdateAction} from 'kaltura-ngx-client/api/types/CategoryUserUpdateAction';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {
  BooleanTypeAdapter,
  FiltersStoreBase,
  NumberTypeAdapter,
    ListTypeAdapter,
  StringTypeAdapter,
  TypeAdaptersMapping
} from '@kaltura-ng/mc-shared/filters';
import {KalturaSearchOperator} from 'kaltura-ngx-client/api/types/KalturaSearchOperator';
import {KalturaSearchOperatorType} from 'kaltura-ngx-client/api/types/KalturaSearchOperatorType';
import {KalturaCategoryUserStatus} from 'kaltura-ngx-client/api/types/KalturaCategoryUserStatus';
import { CategoryGetAction } from 'kaltura-ngx-client/api/types/CategoryGetAction';

export interface LoadingStatus {
  loading: boolean;
  errorMessage: string;
}

export interface EndUserPermissionsUser {
    id: string,
    name: string, // User Name / ID
    permissionLevel: KalturaCategoryUserPermissionLevel; // Permission Level
    status: KalturaCategoryUserStatus; // Active
    updateMethod: KalturaUpdateMethodType; // Update Method
    updatedAt: Date; // Updated On
}

export interface Users {
  items: EndUserPermissionsUser[],
  totalCount: number,
    actualUsersCount: number
}

export interface UsersFilters {
  categoryId: number,
  inheritUsers: boolean,
  freetext: string,
  pageSize: number,
  pageIndex: number,
  permissionLevels: string[],
  status: string[],
  updateMethod: string[],
}


@Injectable()
export class ManageEndUserPermissionsService extends FiltersStoreBase<UsersFilters> implements OnDestroy {

  private _users = {
    data: new BehaviorSubject<Users>({items: [], totalCount: 0, actualUsersCount: null}),
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
  private readonly _pageSizeCacheKey = 'categories.list.pageSize';


  constructor(private _kalturaClient: KalturaClient,
              private browserService: BrowserService,
              private _appLocalization: AppLocalization,
              _logger: KalturaLogger) {
    super(_logger.subLogger('ManageEndUserPermissionsService'));
    this._prepare();
  }


  private _prepare(): void {

      // NOTICE: do not execute here any logic that should run only once.
      // this function will re-run if preparation failed. execute your logic
      // only after the line where we set isReady to true

    if (!this._isReady) {
      const defaultPageSize = this.browserService.getFromLocalStorage(this._pageSizeCacheKey);
      if (defaultPageSize !== null) {
        this.filter({
          pageSize: defaultPageSize
        });
      }

      this._registerToFilterStoreDataChanges();

      this._isReady = true;
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


  public reload(): void {
      this._logger.info(`handle reload action by user`);
    if (this._users.state.getValue().loading) {
        this._logger.info(`another load request is in progress, skip duplicating request`);
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

      this._users.state.next({loading: true, errorMessage: null});

    this._logger.info(`handle loading category data`);

      this._querySubscription = this.buildQueryRequest()
      .cancelOnDestroy(this)
      .subscribe(response => {
              this._logger.info(`handle successful loading category data`);
          this._querySubscription = null;

          this._users.state.next({loading: false, errorMessage: null});

          this._users.data.next({
            items: response.items,
            totalCount: response.totalCount,
              actualUsersCount: response.actualUsersCount
          });
        },
        error => {
          this._querySubscription = null;
          const errorMessage = (error && error.message) ? error.message : typeof error === 'string' ? error : 'invalid error';
            this._logger.warn(`handle failed loading category data`, { errorMessage });
          this._users.state.next({loading: false, errorMessage});
        });
  }


  private buildQueryRequest(): Observable<Users> {
      try {

          const data: UsersFilters = this._getFiltersAsReadonly();

          // create request items
          if (typeof data.categoryId === 'undefined' || typeof data.inheritUsers === 'undefined') {
              //  this is valid condition - this scenario will happen until category id will be provided
              return Observable.of({items: [], totalCount: 0, actualUsersCount: 0});
          }

          const filter: KalturaCategoryUserFilter = new KalturaCategoryUserFilter({
              categoryIdEqual: data.categoryId,
              categoryDirectMembers: false
          });

          const pagination = new KalturaFilterPager(
              {
                  pageSize: data.pageSize,
                  pageIndex: data.pageIndex + 1
              });

          // update desired fields of entries
          const responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
              type: KalturaResponseProfileType.includeFields,
              fields: 'userId,permissionLevel,status,updateMethod,updatedAt'
          });

          const advancedSearch = filter.advancedSearch = new KalturaSearchOperator({});
          advancedSearch.type = KalturaSearchOperatorType.searchAnd;

          // filter 'freeText'
          if (data.freetext) {
              filter.freeText = data.freetext;
          }

          // filter 'status'
          if (data.status && data.status.length > 0) {
              filter.statusIn = data.status.map(e => e).join(',');
          }

          // filter 'updateMethod'
          if (data.updateMethod && data.updateMethod.length > 0) {
              filter.updateMethodIn = data.updateMethod.map(e => e).join(',');
          }

          // filter 'permissionLevels'
          if (data.permissionLevels && data.permissionLevels.length > 0) {
              filter.permissionLevelIn = data.permissionLevels.map(e => e).join(',');
          }

          // remove advanced search arg if it is empty
          if (advancedSearch.items && advancedSearch.items.length === 0) {
              delete filter.advancedSearch;
          }

          if (typeof filter.permissionLevelIn === 'undefined' && !data.inheritUsers) {
              filter.permissionLevelIn = '3,2,1,0';
          }

          const requests = new KalturaMultiRequest(
              new CategoryUserListAction({
                  filter,
                  pager: pagination
              }).setRequestOptions({
                  responseProfile
              }),
              new CategoryGetAction({id: data.categoryId})
          );

          return this._kalturaClient.multiRequest(requests)
              .monitor('ManageEndUserPermissionsService: get Category users')
              .map(result => {
                  if (result.hasErrors()) {
                      throw new Error(result.find(item => !!item.error).error.message);
                  } else {
                      const users = result[0].result.objects;
                      const totalCount = result[0].result.totalCount;
                      const actualUsersCount = result[1].result.membersCount;
                      return {users, totalCount, actualUsersCount};
                  }
              })
              .switchMap(
                  result => this._getKalturaUsers(result.users.map(item => item.userId)),
                  (categoryUserListResult, getKalturaUsersResult) => {
                      const items = categoryUserListResult.users.map((categoryUser, index) => {
                          const kalturaUser = getKalturaUsersResult[index];
                          return {
                              id: categoryUser.userId,
                              name: kalturaUser.screenName || categoryUser.userId,
                              permissionLevel: categoryUser.permissionLevel,
                              status: categoryUser.status,
                              updateMethod: categoryUser.updateMethod,
                              updatedAt: categoryUser.updatedAt
                          };
                      });
                      return {
                          items,
                          totalCount: categoryUserListResult.totalCount,
                          actualUsersCount: categoryUserListResult.actualUsersCount
                      };
                  }
              );
      } catch (err) {
          return Observable.throw(err);
      }
  }

  private _getKalturaUsers(categoryUsersId: string[]): Observable<KalturaUser[]> {
    if (!categoryUsersId) {
      return Observable.throw(new Error('ManageEndUserPermissionsService: Category has no end-users'))
    }
    if (!categoryUsersId.length) {
      return Observable.of([]);
    }
    const multiRequest = new KalturaMultiRequest();
    categoryUsersId.forEach(userId => {
      multiRequest.requests.push(new UserGetAction({
          userId,
        })
      );
    });

    return this._kalturaClient.multiRequest(multiRequest)
      .monitor('ManageEndUserPermissionsService: get Kaltura Users for Category Users')
      .map(
        data => {
          if (data.hasErrors()) {
            throw new Error('ManageEndUserPermissionsService: error occurred while trying to buildQueryRequest');
          }
          return data.map(item => item.result);
        });
  }

  public activateUsers(categoryId: number, usersIds: string[]): Observable<void> {
    if (!usersIds || !usersIds.length) {
      return Observable.throw('Unable to activate users');
    }

    const multiRequest = new KalturaMultiRequest();
    usersIds.forEach(userId => {
      multiRequest.requests.push(new CategoryUserActivateAction({categoryId, userId: userId}));
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

  public deactivateUsers(categoryId: number, usersIds: string[]): Observable<void> {
    if (!usersIds || !usersIds.length) {
      return Observable.throw('Unable to deactivate users');
    }

    const multiRequest = new KalturaMultiRequest();
    usersIds.forEach(userId => {
      multiRequest.requests.push(new CategoryUserDeactivateAction({categoryId, userId}));
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

  public deleteUsers(categoryId: number, usersIds: string[]): Observable<void> {
      this._logger.info(`handle delete users request`, { categoryId, usersIds });
    if (!usersIds || !usersIds.length) {
        this._logger.info(`no users were provided abort action`);
      return Observable.throw('Unable to delete users');
    }

    const multiRequest = new KalturaMultiRequest();
    usersIds.forEach(userId => {
      multiRequest.requests.push(new CategoryUserDeleteAction({categoryId, userId: userId}));
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

  public setPermissionLevel(categoryId: number, usersId: string[], permissionLevel: KalturaCategoryUserPermissionLevel): Observable<void> {
      this._logger.info(`handle set permission level action`, { categoryId, usersId, permissionLevel });
    if (!usersId || !usersId.length || typeof permissionLevel === 'undefined') {
        this._logger.info(`no users or permissionLevel were provided abort action`);
      return Observable.throw('Unable to set permission level for users');
    }

    const multiRequest = new KalturaMultiRequest();
    usersId.forEach(userId => {
      multiRequest.requests.push(new CategoryUserUpdateAction({
        categoryId,
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

  public setUpdateMethod(categoryId: number, usersIds: string[], updateMethod: KalturaUpdateMethodType): Observable<void> {
      this._logger.info(`handle set update method action`, { categoryId, usersIds, updateMethod });
    if (!usersIds || !usersIds.length || typeof updateMethod === 'undefined') {
        this._logger.info(`no users or updateMethod were provided abort action`);
      return Observable.throw('Unable to set update method for users');
    }


    const multiRequest = new KalturaMultiRequest();
    usersIds.forEach(userId => {
      multiRequest.requests.push(new CategoryUserUpdateAction({
        categoryId,
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

      // prevent deletion of filter categoryId
      if (updates.categoryId === null)
      {
        delete updates.categoryId;
      }

      // prevent deletion of filter inheritUsers
      if (updates.inheritUsers === null)
      {
          delete updates.inheritUsers;
      }

      if (typeof updates.pageSize !== 'undefined') {
          this.browserService.setInLocalStorage(this._pageSizeCacheKey, updates.pageSize);
      }

      return updates;
  }

  protected _createDefaultFiltersValue(): UsersFilters {
    return {
      categoryId: null,
      inheritUsers: null,
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
      categoryId: new NumberTypeAdapter(),
        inheritUsers: new BooleanTypeAdapter(),
      freetext: new StringTypeAdapter(),
      pageSize: new NumberTypeAdapter(),
      pageIndex: new NumberTypeAdapter(),
      permissionLevels: new ListTypeAdapter<string>(),
      status: new ListTypeAdapter<string>(),
      updateMethod: new ListTypeAdapter<string>(),
    };
  }
}

