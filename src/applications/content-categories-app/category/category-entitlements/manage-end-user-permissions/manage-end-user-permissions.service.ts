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

export enum SortDirection {
  Desc,
  Asc
}

export interface QueryData {
  pageIndex: number,
  pageSize: number,
  fields: string
}

export interface NewUserData {
  parentUserId: number;
}


@Injectable()
export class ManageEndUserPermissionsService implements OnDestroy {

  private _users = new BehaviorSubject<Users>({items: [], totalCount: 0});
  private _state = new BehaviorSubject<LoadingStatus>({loading: false, errorMessage: null});
  private _usersExecuteSubscription: ISubscription;
  private _queryData = new BehaviorSubject<QueryData>({
    pageIndex: 1,
    pageSize: 50,
    fields: 'userId,permissionLevel,status,updateMethod,updatedAt'
  });

  public state$ = this._state.asObservable(); // state refers only to the users loading
  public users$ = this._users.asObservable();
  public queryData$ = this._queryData.asObservable();
  private _categoryId: number = null;
  private _newUserData: NewUserData = null;

  constructor(private _kalturaClient: KalturaClient,
              private browserService: BrowserService,
              private _widgetService: CategoryEntitlementsWidget,
              private _appLocalization: AppLocalization) {
    const defaultPageSize = this.browserService.getFromLocalStorage('endUsersPermissions.list.pageSize');
    if (defaultPageSize !== null) {
      this._updateQueryData({
        pageSize: defaultPageSize
      });
    }
    this._categoryId = this._widgetService.data.id;
  }

  ngOnDestroy() {
    this._state.complete();
    this._queryData.complete();
    this._users.complete();
    if (this._usersExecuteSubscription) {
      this._usersExecuteSubscription.unsubscribe();
      this._usersExecuteSubscription = null;
    }
  }

  set categoryId(categoryId: number) {
    if (categoryId) {
      this._categoryId = categoryId;
      this.reload(true);
    }
  }

  get categoryId() {
    return this._categoryId;
  }

  public reload(force: boolean): void;
  public reload(query: Partial<QueryData>): void;
  public reload(query: boolean | Partial<QueryData>): void {
    if (!this._categoryId) {
      return undefined;
    }
    const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));

    if (forceReload || this._users.getValue().totalCount === 0) {
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
      this.browserService.setInLocalStorage('endUsersPermissions.list.pageSize', partialData.pageSize);
    }
  }

  private _executeQuery(): void {
    // cancel previous requests
    if (this._usersExecuteSubscription) {
      this._usersExecuteSubscription.unsubscribe();
    }

    this.browserService.scrollToTop();

    this._state.next({loading: true, errorMessage: null});

    // execute the request
    this._usersExecuteSubscription = this._buildQueryRequest(this._queryData.getValue()).subscribe(
      (data: Users) => {
        this._usersExecuteSubscription = null;
        this._state.next({loading: false, errorMessage: null});
        this._users.next(data);
      },
      error => {
        this._usersExecuteSubscription = null;
        const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
        this._state.next({loading: false, errorMessage});
      });
  }

  private _buildQueryRequest(queryData: QueryData): Observable<Users> {
    if (!this._categoryId) {
      return Observable.throw(new Error('ManageEndUserPermissionsService: Category has no end-users'));
    }
    const filter: KalturaCategoryUserFilter = new KalturaCategoryUserFilter({
      categoryIdEqual: this._categoryId
    });
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

    return this._kalturaClient.request(
      new CategoryUserListAction({
        filter,
        pager: pagination,
        responseProfile
      }))
      .monitor('ManageEndUserPermissionsService: get Category users')
      .switchMap((result: KalturaCategoryUserListResponse) => (this._getKalturaUsers(result.objects, result.totalCount)))
      .catch(error => {
        return Observable.throw(new Error('Could not load End-Users Permissions'));
      });
  }

  private _getKalturaUsers(categoryUsers: KalturaCategoryUser[], totalCount: number): Observable<Users> {
    if (!categoryUsers || !categoryUsers.length) {
      return Observable.throw(new Error('ManageEndUserPermissionsService: Category has no end-users'))
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
}

