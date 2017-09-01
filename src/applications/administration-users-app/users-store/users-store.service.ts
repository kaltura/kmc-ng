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
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { KalturaUserListResponse } from 'kaltura-typescript-client/types/KalturaUserListResponse';
import { KalturaUserRoleListResponse } from 'kaltura-typescript-client/types/KalturaUserRoleListResponse';
import { KalturaPermissionListResponse } from 'kaltura-typescript-client/types/KalturaPermissionListResponse';
import { KalturaPartner } from 'kaltura-typescript-client/types/KalturaPartner';
import { BrowserService } from 'app-shared/kmc-shell';
import {UserUpdateAction} from "kaltura-typescript-client/types/UserUpdateAction";

export interface QueryData
{
  pageIndex : number,
  pageSize : number
}

@Injectable()
export class UsersStore implements OnDestroy {
	private _users  = new BehaviorSubject<{items: KalturaUser[], totalCount: number}>({items: [], totalCount: 0});
  private _roles  = new BehaviorSubject<{items: KalturaUserRole[], totalCount: number}>({items: [], totalCount: 0});
  private _partnerPermissions  = new BehaviorSubject<{items: KalturaPermission[]}>({items: []});
  private _partnerInfo  = new BehaviorSubject<{adminLoginUsersQuota: number, adminUserId: string}>({adminLoginUsersQuota: 0, adminUserId: null});
	private _state = new BehaviorSubject<{loading : boolean}>({ loading : false});
  private _querySource = new BehaviorSubject<QueryData>({
    pageIndex: 1,
    pageSize: 25
  });

	public users$ = this._users.asObservable();
  public roles$ = this._roles.asObservable();
  public partnerPermissions$ = this._partnerPermissions.asObservable();
  public partnerInfo$ = this._partnerInfo.asObservable();
	public state$ = this._state.asObservable();
  public query$ = this._querySource.monitor('queryData update');

	constructor(
    private _kalturaServerClient: KalturaClient,
    private _browserService: BrowserService,
  ) {
    const defaultPageSize = this._browserService.getFromLocalStorage("users.list.pageSize");
    if (defaultPageSize !== null) {
      this._updateQueryData({
        pageSize: defaultPageSize
      });
    }
	  this._loadData();
  }

  public get roles() : KalturaUserRole[] {
    return this._roles.getValue().items;
  }

  public get partnerInfo() : any {
    return this._partnerInfo.getValue();
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

  public reload(query: Partial<QueryData>): void {
	  this._updateQueryData(query);
	  this._loadData();
  }

  private _loadData(): void {
    this._state.next({loading: true});

    this._kalturaServerClient.multiRequest(
      new KalturaMultiRequest(
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
      )
    )
    .cancelOnDestroy(this)
    .subscribe(
      data => {
        data.forEach(response => {
          this._state.next({loading: false});

          switch (response.result.constructor) {
            case KalturaUserRoleListResponse:
              this._roles.next({
                items : response.result.objects,
                totalCount: response.result.totalCount
              });
              break;
            case KalturaUserListResponse:
              this._users.next({
                items : response.result.objects,
                totalCount: response.result.totalCount
              });
              break;
            case KalturaPermissionListResponse:
              this._partnerPermissions.next({
                items : response.result.objects
              });
              break;
            case KalturaPartner:
              this._partnerInfo.next({
                adminLoginUsersQuota : response.result.adminLoginUsersQuota,
                adminUserId: response.result.adminUserId
              });
              break;
          }
        })
      },
      error => {
        this._state.next({
          loading: true
        });
      }
    );
  }

  public toggleUserStatus(user: KalturaUser): void {
    this._state.next({loading: true});
    user.status = +!user.status;

    this._kalturaServerClient.multiRequest(
      new KalturaMultiRequest(
        new UserUpdateAction (
          {
            userId: user.id,
            user: new KalturaUser({status: user.status})
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
        )
      )
    )
    .cancelOnDestroy(this)
    .subscribe(
      data => {
        data.forEach(response => {
          this._state.next({loading: false});

          if(response.result instanceof KalturaUserListResponse) {
            this._users.next({
              items : response.result.objects,
              totalCount: response.result.totalCount
            });
          }
        })
      },
      error => {
        this._state.next({
          loading: true
        });
      }
    );
  }

  ngOnDestroy() {
    this._querySource.complete();
  }
}

