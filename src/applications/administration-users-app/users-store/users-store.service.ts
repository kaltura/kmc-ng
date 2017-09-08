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
import { PermissionListAction } from 'kaltura-typescript-client/types/PermissionListAction';
import { KalturaPermissionFilter } from 'kaltura-typescript-client/types/KalturaPermissionFilter';
import { KalturaPermissionType } from 'kaltura-typescript-client/types/KalturaPermissionType';
import { KalturaPermissionStatus } from 'kaltura-typescript-client/types/KalturaPermissionStatus';
import { KalturaPermission } from 'kaltura-typescript-client/types/KalturaPermission';
import { PartnerGetInfoAction } from 'kaltura-typescript-client/types/PartnerGetInfoAction';
import { BrowserService } from 'app-shared/kmc-shell';
import { UserUpdateAction } from 'kaltura-typescript-client/types/UserUpdateAction';
import { UserDeleteAction } from 'kaltura-typescript-client/types/UserDeleteAction';
import { Observable } from 'rxjs/Observable';
import { AppLocalization } from '@kaltura-ng/kaltura-common';

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
    partnerPermissions: {items: KalturaPermission[]},
    partnerInfo : {adminLoginUsersQuota: number, adminUserId: string}
  }>({
    users: {items: [], totalCount: 0},
    roles: {items: [], totalCount: 0},
    partnerPermissions: {items: []},
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
    private _appLocalization: AppLocalization
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
        new PermissionListAction (
          {
            filter: new KalturaPermissionFilter({
              typeIn: KalturaPermissionType.specialFeature + ',' + KalturaPermissionType.plugin,
              statusEqual: KalturaPermissionStatus.active
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
            partnerPermissions: {
              items : response[2].result.objects
            },
            partnerInfo: {
              adminLoginUsersQuota : response[3].result.adminLoginUsersQuota,
              adminUserId: response[3].result.adminUserId
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
    return Observable.create(observer => {
      this._kalturaServerClient.request(
        new UserUpdateAction (
          {
            userId: user.id,
            user: new KalturaUser({status: +!user.status})
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

  public deleteUser(userId: string) : Observable<void> {
    return Observable.create(observer => {
      this._kalturaServerClient.request(
        new UserDeleteAction (
          {
            userId: userId
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

  public saveUser() : void {}

  ngOnDestroy() {
    this._querySource.complete();
  }
}

