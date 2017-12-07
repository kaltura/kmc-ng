import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { Observable } from 'rxjs/Observable';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { FormGroup } from '@angular/forms';
import { IsUserExistsStatuses } from './user-exists-statuses';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaUser } from 'kaltura-ngx-client/api/types/KalturaUser';
import { KalturaUserRole } from 'kaltura-ngx-client/api/types/KalturaUserRole';
import { KalturaClient } from 'kaltura-ngx-client';
import { UserRoleListAction } from 'kaltura-ngx-client/api/types/UserRoleListAction';
import { KalturaUserRoleFilter } from 'kaltura-ngx-client/api/types/KalturaUserRoleFilter';
import { KalturaUserRoleStatus } from 'kaltura-ngx-client/api/types/KalturaUserRoleStatus';
import { KalturaUserRoleOrderBy } from 'kaltura-ngx-client/api/types/KalturaUserRoleOrderBy';
import { UserListAction } from 'kaltura-ngx-client/api/types/UserListAction';
import { KalturaUserFilter } from 'kaltura-ngx-client/api/types/KalturaUserFilter';
import { KalturaNullableBoolean } from 'kaltura-ngx-client/api/types/KalturaNullableBoolean';
import { KalturaUserStatus } from 'kaltura-ngx-client/api/types/KalturaUserStatus';
import { KalturaUserOrderBy } from 'kaltura-ngx-client/api/types/KalturaUserOrderBy';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { PartnerGetInfoAction } from 'kaltura-ngx-client/api/types/PartnerGetInfoAction';
import { UserUpdateAction } from 'kaltura-ngx-client/api/types/UserUpdateAction';
import { UserDeleteAction } from 'kaltura-ngx-client/api/types/UserDeleteAction';
import { UserGetByLoginIdAction } from 'kaltura-ngx-client/api/types/UserGetByLoginIdAction';
import { UserGetAction } from 'kaltura-ngx-client/api/types/UserGetAction';
import { UserEnableLoginAction } from 'kaltura-ngx-client/api/types/UserEnableLoginAction';
import { UserAddAction } from 'kaltura-ngx-client/api/types/UserAddAction';

export interface QueryData {
  pageIndex: number,
  pageSize: number
}

@Injectable()
export class UsersStore implements OnDestroy {
  private _usersData = new BehaviorSubject<{
    users: { items: KalturaUser[], totalCount: number },
    roles: { items: KalturaUserRole[], totalCount: number },
    partnerInfo: { adminLoginUsersQuota: number, adminUserId: string }
  }>({
    users: { items: [], totalCount: 0 },
    roles: { items: [], totalCount: 0 },
    partnerInfo: { adminLoginUsersQuota: 0, adminUserId: null }
  });
  private _state = new BehaviorSubject<{ errorMessage?: string }>({});
  private _querySource = new BehaviorSubject<QueryData>({
    pageIndex: 1,
    pageSize: 25
  });

  usersData$ = this._usersData.asObservable();
  state$ = this._state.asObservable();
  query$ = this._querySource.monitor('queryData update');

  constructor(private _kalturaServerClient: KalturaClient,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _appAuthentication: AppAuthentication) {
    const defaultPageSize = this._browserService.getFromLocalStorage('users.list.pageSize');
    if (defaultPageSize !== null) {
      this._updateQueryData({
        pageSize: defaultPageSize
      });
    }
    this._loadData();
  }

  private _updateQueryData(partialData: Partial<QueryData>): void {
    const newQueryData = Object.assign({}, this._querySource.getValue(), partialData);
    this._querySource.next(newQueryData);

    if (partialData.pageSize) {
      this._browserService.setInLocalStorage('users.list.pageSize', partialData.pageSize);
    }
  }

  public reload(force: boolean): void;
  public reload(query: Partial<QueryData>): void;
  public reload(query: boolean | Partial<QueryData>): void {
    const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));
    if (forceReload || this._usersData.getValue().users.totalCount === 0) {
      if (typeof query === 'object') {
        this._updateQueryData(query);
      }
      this._loadData();
    }
  }

  private _loadData(): void {
    this._kalturaServerClient.multiRequest([
      new UserRoleListAction(
        {
          filter: new KalturaUserRoleFilter({
            statusEqual: KalturaUserRoleStatus.active,
            orderBy: KalturaUserRoleOrderBy.idAsc.toString(),
            tagsMultiLikeOr: 'kmc'
          })
        }
      ),
      new UserListAction(
        {
          filter: new KalturaUserFilter({
            isAdminEqual: KalturaNullableBoolean.trueValue,
            loginEnabledEqual: KalturaNullableBoolean.trueValue,
            statusIn: KalturaUserStatus.active + ',' + KalturaUserStatus.blocked,
            orderBy: KalturaUserOrderBy.createdAtAsc.toString()
          }),
          pager: new KalturaFilterPager({
            pageSize: this._querySource.getValue().pageSize,
            pageIndex: this._querySource.getValue().pageIndex
          })
        }
      ),
      new PartnerGetInfoAction()
    ])
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        response => {
          if (!response.hasErrors()) {
            this._usersData.next({
              users: {
                items: response[1].result.objects,
                totalCount: response[1].result.totalCount
              },
              roles: {
                items: response[0].result.objects,
                totalCount: response[0].result.totalCount
              },
              partnerInfo: {
                adminLoginUsersQuota: response[2].result.adminLoginUsersQuota,
                adminUserId: response[2].result.adminUserId
              }
            });
          } else {
            this._state.next({ errorMessage: this._appLocalization.get('applications.administration.users.failedLoading') });
          }

        },
        error => {
          this._state.next({ errorMessage: this._appLocalization.get('applications.administration.users.failedLoading') });
        }
      );
  }

  public toggleUserStatus(user: KalturaUser): Observable<void> {
    let userStatus: number = user.status;
    this._usersData.getValue().users.items.forEach(item => {
      if (user.id === item.id) {
        userStatus = item.status;
      }
    });
    return Observable.create(observer => {
      if (this._appAuthentication.appUser.id !== user.id || this._usersData.getValue() && this._usersData.getValue().partnerInfo.adminUserId !== user.id) {
        this._kalturaServerClient.request(
          new UserUpdateAction(
            {
              userId: user.id,
              user: new KalturaUser({ status: +!userStatus })
            }
          )
        )
          .cancelOnDestroy(this)
          .subscribe(
            () => {
              observer.next();
              observer.complete();
            },
            error => {
              observer.error(error);
            }
          );
      } else {
        observer.error(new Error(this._appLocalization.get('applications.administration.users.cantPerform')));
      }
    });
  }

  public deleteUser(user: KalturaUser): Observable<void> {
    return Observable.create(observer => {
      if (this._appAuthentication.appUser.id !== user.id || this._usersData.getValue() && this._usersData.getValue().partnerInfo.adminUserId !== user.id) {
        this._kalturaServerClient.request(
          new UserDeleteAction(
            {
              userId: user.id
            }
          )
        )
          .cancelOnDestroy(this)
          .subscribe(
            () => {
              observer.next();
              observer.complete();
            },
            error => {
              observer.error(error);
            }
          );
      } else {
        observer.error(new Error(this._appLocalization.get('applications.administration.users.cantPerform')));
      }
    });
  }

  public isUserAlreadyExists(email: string): Observable<IsUserExistsStatuses> {
    return Observable.create(observer => {
      this._kalturaServerClient.request(
        new UserGetByLoginIdAction(
          {
            loginId: email
          }
        )
      )
        .cancelOnDestroy(this)
        .subscribe(
          () => {
            observer.next(IsUserExistsStatuses.kmcUser);
            observer.complete();
          },
          error => {
            observer.error(error.code === 'LOGIN_DATA_NOT_FOUND' ? IsUserExistsStatuses.otherSystemUser : (error.code === 'USER_NOT_FOUND' ? IsUserExistsStatuses.unknownUser : ''));
          }
        );
    });
  }

  public isUserAssociated(email: string): Observable<KalturaUser> {
    return Observable.create(observer => {
      this._kalturaServerClient.request(
        new UserGetAction(
          {
            userId: email
          }
        )
      )
        .cancelOnDestroy(this)
        .subscribe(
          user => {
            observer.next(user);
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
    });
  }

  public addUser(userForm: FormGroup): Observable<KalturaUser> {
    return Observable.create(observer => {
      let roleIds = userForm.controls['roleIds'].value,
        publisherId = userForm.controls['id'].value;
      this._kalturaServerClient.request(
        new UserAddAction(
          {
            user: new KalturaUser({
              email: userForm.controls['email'].value,
              firstName: userForm.controls['firstName'].value,
              lastName: userForm.controls['lastName'].value,
              roleIds: roleIds ? roleIds : this._usersData.getValue().roles.items[0].id,
              id: publisherId ? publisherId : userForm.controls['email'].value,
              isAdmin: true
            })
          }
        ))
        .cancelOnDestroy(this)
        .subscribe(
          response => {
            observer.next(response);
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
    });
  }

  public updateUser(userForm: FormGroup): Observable<void> {
    return Observable.create(observer => {
      let roleIds = userForm.controls['roleIds'].value,
        publisherId = userForm.controls['id'].value;
      this._kalturaServerClient.request(
        new UserUpdateAction(
          {
            userId: publisherId,
            user: new KalturaUser({
              email: userForm.controls['email'].value,
              firstName: userForm.controls['firstName'].value,
              lastName: userForm.controls['lastName'].value,
              roleIds: roleIds ? roleIds : this._usersData.getValue().roles.items[0].id,
              id: publisherId ? publisherId : userForm.controls['email'].value
            })
          }
        )
      )
        .cancelOnDestroy(this)
        .subscribe(
          () => {
            observer.next();
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
    });
  }

  public updateUserPermissions(user: KalturaUser, userForm: FormGroup): Observable<void> {
    let roleIds = userForm.controls['roleIds'].value;
    return Observable.create(observer => {
      this._kalturaServerClient.request(
        new UserUpdateAction(
          {
            userId: user.id,
            user: new KalturaUser({
              roleIds: roleIds ? roleIds : this._usersData.getValue().roles.items[0].id,
              isAdmin: true
            })
          }
        )
      )
        .cancelOnDestroy(this)
        .subscribe(
          () => {
            observer.next();
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
    });
  }

  public enableUserLogin(user: KalturaUser): Observable<void> {
    return Observable.create(observer => {
      this._kalturaServerClient.request(
        new UserEnableLoginAction(
          {
            userId: user.id,
            loginId: user.email,
            password: user.password
          }
        )
      )
        .cancelOnDestroy(this)
        .subscribe(
          () => {
            observer.next();
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
    });
  }

  ngOnDestroy() {
    this._usersData.complete();
    this._state.complete();
    this._querySource.complete();
  }
}

