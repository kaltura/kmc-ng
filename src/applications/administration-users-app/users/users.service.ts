import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { IsUserExistsStatuses } from './user-exists-statuses';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { KalturaAPIException, KalturaKeyValueExtended, KalturaUser, UserDemoteAdminAction, UserExportToCsvAction } from 'kaltura-ngx-client';
import { KalturaUserRole } from 'kaltura-ngx-client';
import { KalturaClient, KalturaMultiRequest } from 'kaltura-ngx-client';
import { UserRoleListAction } from 'kaltura-ngx-client';
import { KalturaUserRoleFilter } from 'kaltura-ngx-client';
import { KalturaUserRoleStatus } from 'kaltura-ngx-client';
import { KalturaUserRoleOrderBy } from 'kaltura-ngx-client';
import { UserListAction } from 'kaltura-ngx-client';
import { KalturaUserFilter } from 'kaltura-ngx-client';
import { KalturaNullableBoolean } from 'kaltura-ngx-client';
import { KalturaUserStatus } from 'kaltura-ngx-client';
import { KalturaUserOrderBy } from 'kaltura-ngx-client';
import { KalturaFilterPager } from 'kaltura-ngx-client';
import { PartnerGetInfoAction } from 'kaltura-ngx-client';
import { UserUpdateAction } from 'kaltura-ngx-client';
import { UserDeleteAction } from 'kaltura-ngx-client';
import { UserGetByLoginIdAction } from 'kaltura-ngx-client';
import { UserGetAction } from 'kaltura-ngx-client';
import { UserEnableLoginAction } from 'kaltura-ngx-client';
import { UserAddAction } from 'kaltura-ngx-client';
import { AdminUsersMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface QueryData {
  pageIndex: number;
  pageSize: number;
}

export interface ExtendedKalturaUser extends KalturaUser {
    roleName: string;
}

interface UsersData {
  users: { items: ExtendedKalturaUser[], totalCount: number };
  roles: { items: KalturaUserRole[], totalCount: number };
  partnerInfo: { adminLoginUsersQuota: number, adminUserId: string };
}

@Injectable()
export class UsersStore implements OnDestroy {
  private _users = {
    data: new BehaviorSubject<UsersData>({
      users: { items: [], totalCount: 0 },
      roles: { items: [], totalCount: 0 },
      partnerInfo: { adminLoginUsersQuota: 0, adminUserId: null }
    }),
    state: new BehaviorSubject<{ loading?: boolean, error?: string }>({})
  };
  private _querySource = new BehaviorSubject<QueryData>({
    pageIndex: 1,
    pageSize: 25
  });

  private get _usersDataValue(): UsersData {
    return this._users.data.value;
  }

  public query$ = this._querySource;
  public readonly users = { data$: this._users.data.asObservable(), state$: this._users.state.asObservable() };

  constructor(private _kalturaServerClient: KalturaClient,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _appAuthentication: AppAuthentication,
              adminUsersMainViewService: AdminUsersMainViewService) {
    if (adminUsersMainViewService.isAvailable()) {
        const defaultPageSize = this._browserService.getFromLocalStorage('users.list.pageSize');
        if (defaultPageSize !== null) {
            this._updateQueryData({
                pageSize: defaultPageSize
            });
        }
        this._loadData();
    }
  }

  ngOnDestroy() {
    this._users.data.complete();
    this._users.state.complete();
    this._querySource.complete();
  }

  private _updateQueryData(partialData: Partial<QueryData>): void {
    const newQueryData = Object.assign({}, this._querySource.getValue(), partialData);
    this._querySource.next(newQueryData);

    if (partialData.pageSize) {
      this._browserService.setInLocalStorage('users.list.pageSize', partialData.pageSize);
    }
  }

  private _loadData(): void {
    this._users.state.next({ loading: true, error: null });
    this._kalturaServerClient
      .multiRequest([
        new UserRoleListAction({
          filter: new KalturaUserRoleFilter({
            statusEqual: KalturaUserRoleStatus.active,
            orderBy: KalturaUserRoleOrderBy.idAsc.toString(),
            tagsMultiLikeOr: 'kmc'
          }),
        pager: new KalturaFilterPager({ pageSize: 500, pageIndex: 0})
        }),
        new UserListAction({
          filter: new KalturaUserFilter({
            isAdminEqual: KalturaNullableBoolean.trueValue,
            loginEnabledEqual: KalturaNullableBoolean.trueValue,
            statusIn: KalturaUserStatus.active + ',' + KalturaUserStatus.blocked,
            orderBy: KalturaUserOrderBy.createdAtAsc.toString()
          }),
          pager: new KalturaFilterPager(this._querySource.value)
        }),
        new PartnerGetInfoAction()
      ])
      .pipe(cancelOnDestroy(this))
      .subscribe(
        response => {
          if (!response.hasErrors()) {
            const [roles, users, partnerInfo] = response;
              const usersItems = users.result.objects.map(user => {
                  const relevantRole = roles.result.objects.find(role => String(role.id) === user.roleIds);
                  user.roleName = relevantRole ? relevantRole.name : '';
                  return user;
              });
            this._users.data.next({
              users: {
                items: usersItems,
                totalCount: users.result.totalCount
              },
              roles: {
                items: roles.result.objects,
                totalCount: roles.result.totalCount
              },
              partnerInfo: {
                adminLoginUsersQuota: partnerInfo.result.adminLoginUsersQuota,
                adminUserId: partnerInfo.result.adminUserId
              }
            });
            this._users.state.next({ loading: false, error: null });
          } else {
            this._users.state.next({ loading: false, error: this._appLocalization.get('applications.administration.users.failedLoading') });
          }
        },
        () => {
          this._users.state.next({ loading: false, error: this._appLocalization.get('applications.administration.users.failedLoading') });
        }
      );
  }

  public export(): void {
      const request = new UserExportToCsvAction({
              filter: new KalturaUserFilter({
                  isAdminEqual: KalturaNullableBoolean.trueValue,
                  loginEnabledEqual: KalturaNullableBoolean.trueValue,
                  statusIn: KalturaUserStatus.active + ',' + KalturaUserStatus.blocked,
                  orderBy: KalturaUserOrderBy.createdAtAsc.toString()
              }),
                mappedFields: [
                    new KalturaKeyValueExtended({key: 'Role', value: 'roleNames', predefinedFormat: KalturaNullableBoolean.falseValue}),
                    new KalturaKeyValueExtended({key: 'Status', value: 'status', predefinedFormat: KalturaNullableBoolean.trueValue}),
                    new KalturaKeyValueExtended({key: 'Registration Date', value: 'createdAt', predefinedFormat: KalturaNullableBoolean.trueValue}),
                    new KalturaKeyValueExtended({key: 'Last Login', value: 'lastLoginTime', predefinedFormat: KalturaNullableBoolean.trueValue})
                ]
          });
      this._kalturaServerClient.request(request)
          .pipe(tag('block-shell'))
          .pipe(cancelOnDestroy(this))
          .subscribe(
              response => {
                  this._browserService.alert({
                      header: this._appLocalization.get('applications.administration.users.export'),
                      message: this._appLocalization.get('app.common.export')
                  });
              },
              (e: KalturaAPIException) => {
                  this._browserService.alert({
                      header: this._appLocalization.get('app.common.error'),
                      message: e.message
                  });
              }
          );
  }

  public isCurrentUser(user: KalturaUser): boolean {
      return this._appAuthentication.appUser.id === user.id;
  }

  public toggleUserStatus(user: KalturaUser): Observable<void> {
    const isCurrentUser = this.isCurrentUser(user);
    const isAdminUser = this._usersDataValue && this._usersDataValue.partnerInfo.adminUserId === user.id;

    if (isCurrentUser || isAdminUser) {
      return throwError(new Error(this._appLocalization.get('applications.administration.users.cantPerform')));
    }

    const relevantUser = this._usersDataValue.users.items.find(item => user.id === item.id);
    const newStatus = Number(relevantUser && !relevantUser.status);

    return this._kalturaServerClient
      .request(
        new UserUpdateAction({
          userId: user.id,
          user: new KalturaUser({ status: newStatus })
        })
      ).pipe(map(() => {
        return;
      }));
  }

  public deleteUser(user: KalturaUser): Observable<void> {
    const isCurrentUser = this.isCurrentUser(user);
    const isAdminUser = this._usersDataValue && this._usersDataValue.partnerInfo.adminUserId === user.id;

    if (isCurrentUser || isAdminUser) {
      return throwError(new Error(this._appLocalization.get('applications.administration.users.cantPerform')));
    }

    return this._kalturaServerClient
      .request(new UserDeleteAction({ userId: user.id }))
      .pipe(map(() => {
        return;
      }));
  }

  public demoteUser(user: KalturaUser): Observable<void> {
    const isCurrentUser = this.isCurrentUser(user);
    const isAdminUser = this._usersDataValue && this._usersDataValue.partnerInfo.adminUserId === user.id;

    if (isCurrentUser || isAdminUser) {
      return throwError(new Error(this._appLocalization.get('applications.administration.users.cantPerform')));
    }

    return this._kalturaServerClient
      .request(new UserDemoteAdminAction({ userId: user.id }))
      .pipe(map(() => {
        return;
      }));
  }

  public isUserAlreadyExists(email: string): Observable<IsUserExistsStatuses | null> {
    return this._kalturaServerClient
      .request(new UserGetByLoginIdAction({ loginId: email }))
      .pipe(map(() => {
        return IsUserExistsStatuses.kmcUser;
      }))
      .pipe(catchError(error => {
        const status = error.code === 'LOGIN_DATA_NOT_FOUND'
          ? IsUserExistsStatuses.unknownUser :
          (error.code === 'USER_NOT_FOUND' ? IsUserExistsStatuses.otherKMCUser : null);
        return of(status);
      }));
  }

  public getUserById(userId: string): Observable<KalturaUser> {
    return this._kalturaServerClient.request(new UserGetAction({ userId }));
  }

  public addUser(userData: { roleIds: string, id: string, email: string, firstName: string, lastName: string, ssoUser: boolean }): Observable<void> {
    const { roleIds, id, email, firstName, lastName, ssoUser } = userData;

    if (!email || !firstName || !lastName || !roleIds) {
      return throwError(new Error(this._appLocalization.get('applications.administration.users.addUserError')));
    }

    const user = new KalturaUser({
      email,
      firstName,
      lastName,
      roleIds: roleIds,
      id: id || email,
      isAdmin: true,
      loginEnabled: true,
      isSsoExcluded: !ssoUser
    });

    return this._kalturaServerClient
        .request(new UserAddAction({ user }))
        .pipe(map(() => {}));
  }

  public updateUser(userData: { roleIds: string, id: string, email: string, ssoUser?: boolean}, userId: string, isHashedUserId = false): Observable<void> {
    const { roleIds, id, email } = userData;

    if ((!id && !email) || !userId || !roleIds) {
      return throwError(new Error(this._appLocalization.get('applications.administration.users.invalidUserId')));
    }

    const user = isHashedUserId ?
        new KalturaUser({roleIds, email}) :
        new KalturaUser({roleIds, id: id || email, email});
    if (userData.ssoUser !== undefined) {
        user.isSsoExcluded = !userData.ssoUser
    }
    return this._kalturaServerClient
      .request(new UserUpdateAction({ userId, user }))
      .pipe(map(() => {
        return;
      }));
  }

  public associateUserToAccount(userProvidedEmail: string, user: KalturaUser, roleIds: string): Observable<void> {

      if (!user || !roleIds) {
          return throwError(new Error('cannot associate user to account'));
      }
    const updatedUser = new KalturaUser({
      roleIds: roleIds,
      isAdmin: true
    });
    const request = new KalturaMultiRequest(
      new UserUpdateAction({ userId: user.id, user: updatedUser }),
      new UserEnableLoginAction({ userId: user.id, loginId: userProvidedEmail })
    );
    return this._kalturaServerClient
      .multiRequest(request)
      .pipe(map((responses) => {
        if (responses.hasErrors()) {
          const errorMessage = responses.map(response => {
            if (response.error) {
              return response.error.message + '\n';
            }
          }).join('');
          throw Error(errorMessage);
        }
      }));
  }

  public reload(force: boolean): void;
  public reload(query: Partial<QueryData>): void;
  public reload(query: boolean | Partial<QueryData>): void {
    const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));
    if (forceReload || this._usersDataValue.users.totalCount === 0) {
      if (typeof query === 'object') {
        this._updateQueryData(query);
      }
      this._loadData();
    }
  }
}

