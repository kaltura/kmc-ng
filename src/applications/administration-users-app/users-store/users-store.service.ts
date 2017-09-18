import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { UserListAction } from 'kaltura-typescript-client/types/UserListAction';
import { UserRoleListAction } from 'kaltura-typescript-client/types/UserRoleListAction';
import { KalturaUserRoleFilter } from 'kaltura-typescript-client/types/KalturaUserRoleFilter';
import { KalturaUserRoleStatus } from 'kaltura-typescript-client/types/KalturaUserRoleStatus';
import { KalturaUserRoleOrderBy } from 'kaltura-typescript-client/types/KalturaUserRoleOrderBy';
import { KalturaUserRole } from 'kaltura-typescript-client/types/KalturaUserRole';
import { KalturaUserFilter } from 'kaltura-typescript-client/types/KalturaUserFilter';
import { KalturaNullableBoolean } from 'kaltura-typescript-client/types/KalturaNullableBoolean';
import { KalturaUserStatus } from 'kaltura-typescript-client/types/KalturaUserStatus';
import { KalturaUserOrderBy } from 'kaltura-typescript-client/types/KalturaUserOrderBy';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaUser } from 'kaltura-typescript-client/types/KalturaUser';
import { PartnerGetInfoAction } from 'kaltura-typescript-client/types/PartnerGetInfoAction';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { UserUpdateAction } from 'kaltura-typescript-client/types/UserUpdateAction';
import { UserDeleteAction } from 'kaltura-typescript-client/types/UserDeleteAction';
import { Observable } from 'rxjs/Observable';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { FormGroup } from '@angular/forms';
import { UserGetByLoginIdAction } from 'kaltura-typescript-client/types/UserGetByLoginIdAction';
import { UserGetAction } from 'kaltura-typescript-client/types/UserGetAction';
import { UserAddAction } from 'kaltura-typescript-client/types/UserAddAction';
import { UserEnableLoginAction } from 'kaltura-typescript-client/types/UserEnableLoginAction';

export interface QueryData
{
  pageIndex : number,
  pageSize : number
}

@Injectable()
export class UsersStore implements OnDestroy {
  private _usersData = new BehaviorSubject<{
    users: {items: KalturaUser[], totalCount: number},
    roles: {items: KalturaUserRole[], totalCount: number},
    partnerInfo : {adminLoginUsersQuota: number, adminUserId: string}
  }>({
    users: {items: [], totalCount: 0},
    roles: {items: [], totalCount: 0},
    partnerInfo: {adminLoginUsersQuota: 0, adminUserId: null}
  });
	private _state = new BehaviorSubject<{loading : boolean, errorMessage?: string}>({ loading : false});
  private _querySource = new BehaviorSubject<QueryData>({
    pageIndex: 1,
    pageSize: 25
  });

  public usersData$ = this._usersData.asObservable();
	public state$ = this._state.asObservable();
  public query$ = this._querySource.monitor('queryData update');

	constructor(
    private _kalturaServerClient: KalturaClient,
    private _browserService: BrowserService,
    private _appLocalization: AppLocalization,
    private _appAuthentication: AppAuthentication
  ) {
    const defaultPageSize = this._browserService.getFromLocalStorage("users.list.pageSize");
    if (defaultPageSize !== null) {
      this._updateQueryData({
        pageSize: defaultPageSize
      });
    }
	  this._loadData();
  }

  private _updateQueryData(partialData : Partial<QueryData>) : void
  {
    const newQueryData =Object.assign({}, this._querySource.getValue(), partialData);
    this._querySource.next(newQueryData);

    if (partialData.pageSize)
    {
      this._browserService.setInLocalStorage("users.list.pageSize", partialData.pageSize);
    }
  }

  public reload(force : boolean) : void;
  public reload(query : Partial<QueryData>) : void;
  public reload(query : boolean | Partial<QueryData>): void {
    const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));

    if (forceReload || this._usersData.getValue().users.totalCount === 0) {
      if (typeof query === 'object') {
        this._updateQueryData(query);
      }
      this._loadData();
    }
  }

  private _loadData(): void {
    this._state.next({loading: true});

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
              statusIn: KalturaUserStatus.active + "," + KalturaUserStatus.blocked,
              orderBy: KalturaUserOrderBy.createdAtAsc.toString()
            }),
            pager: new KalturaFilterPager({
              pageSize: this._querySource.getValue().pageSize,
              pageIndex: this._querySource.getValue().pageIndex
            })
          }
        ),
        new PartnerGetInfoAction ()
      ])
    .cancelOnDestroy(this)
    .subscribe(
      response => {
        if(!response.hasErrors()) {
          this._state.next({loading: false});

          this._usersData.next({
            users: {
              items : response[1].result.objects,
              totalCount: response[1].result.totalCount
            },
            roles: {
              items : response[0].result.objects,
              totalCount: response[0].result.totalCount
            },
            partnerInfo: {
              adminLoginUsersQuota : response[2].result.adminLoginUsersQuota,
              adminUserId: response[2].result.adminUserId
            }
          });
        } else {
          this._state.next({ loading: false, errorMessage: this._appLocalization.get('applications.content.users.failedLoading') });
        }

      },
      error => {
        this._state.next({ loading: false, errorMessage: error.message });
      }
    );
  }

  public toggleUserStatus(user: KalturaUser): Observable<void> {
    let userStatus: number = user.status;
    this._usersData.getValue().users.items.forEach(item => {
      if(user.id === item.id) {
        userStatus = item.status;
      }
    });
      return Observable.create(observer => {
        if(this._appAuthentication.appUser.id !== user.id || this._usersData.getValue() && this._usersData.getValue().partnerInfo.adminUserId !== user.id) {
          this._kalturaServerClient.request(
            new UserUpdateAction(
              {
                userId: user.id,
                user: new KalturaUser({status: +!userStatus})
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
          observer.error(new Error(this._appLocalization.get('applications.content.users.cantPerform')));
        }
      });
  }

  public deleteUser(user: KalturaUser) : Observable<void> {
    return Observable.create(observer => {
      if(this._appAuthentication.appUser.id !== user.id || this._usersData.getValue() && this._usersData.getValue().partnerInfo.adminUserId !== user.id) {
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
        observer.error(new Error(this._appLocalization.get('applications.content.users.cantPerform')));
      }
    });
  }

  public isUserAlreadyExist(email: string) : Observable<void> {
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
            observer.next();
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
    });
  }

  public isUserAssociated(email: string) : Observable<KalturaUser> {
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

  public addUser(userForm: FormGroup) : Observable<void> {
    return Observable.create(observer => {
      let roleIds = userForm.controls['roleIds'].value,
          publisherId = userForm.controls['id'].value;
      this._kalturaServerClient.request(
        new UserAddAction(
          {
            user: new KalturaUser({
              email:      userForm.controls['email'].value,
              firstName:  userForm.controls['firstName'].value,
              lastName:   userForm.controls['lastName'].value,
              roleIds:    roleIds ? roleIds : this._usersData.getValue().roles.items[0].id,
              id:         publisherId ? publisherId : userForm.controls['email'].value,
              isAdmin:    true
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

  public updateUser(userForm: FormGroup) : Observable<void> {
    return Observable.create(observer => {
      let roleIds = userForm.controls['roleIds'].value,
          publisherId = userForm.controls['id'].value;
      this._kalturaServerClient.request(
        new UserUpdateAction(
          {
            userId: publisherId,
            user: new KalturaUser({
              email:      userForm.controls['email'].value,
              firstName:  userForm.controls['firstName'].value,
              lastName:   userForm.controls['lastName'].value,
              roleIds:    roleIds ? roleIds : this._usersData.getValue().roles.items[0].id,
              id:         publisherId ? publisherId : userForm.controls['email'].value
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

  public updateUserPermissions(user: KalturaUser, userForm: FormGroup) : Observable<void> {
    let roleIds = userForm.controls['roleIds'].value,
        publisherId = userForm.controls['id'].value;
    return Observable.create(observer => {
      this._kalturaServerClient.request(
        new UserUpdateAction(
          {
            userId: user.id,
            user: new KalturaUser({
              email:      userForm.controls['email'].value,
              firstName:  userForm.controls['firstName'].value,
              lastName:   userForm.controls['lastName'].value,
              roleIds:    roleIds ? roleIds : this._usersData.getValue().roles.items[0].id,
              id:         publisherId ? publisherId : userForm.controls['email'].value,
              isAdmin:    true
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

  public enableUserLogin(user: KalturaUser) : Observable<void> {
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
    this._querySource.complete();
  }
}

