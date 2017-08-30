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

@Injectable()
export class UsersStore implements OnDestroy {
	private _users  = new BehaviorSubject<{items: KalturaUser[], totalCount: number}>({items: [], totalCount: 0});
  private _roles  = new BehaviorSubject<{items: KalturaUserRole[], totalCount: number}>({items: [], totalCount: 0});
  private _partnerPermissions  = new BehaviorSubject<{items: KalturaPermission[]}>({items: []});
  private _partnerInfo  = new BehaviorSubject<{adminLoginUsersQuota: number, adminUserId: string}>({adminLoginUsersQuota: 0, adminUserId: null});
	private _state = new BehaviorSubject<{loading : boolean}>({ loading : false});

	public users$ = this._users.asObservable();
  public roles$ = this._roles.asObservable();
  public partnerPermissions$ = this._partnerPermissions.asObservable();
  public partnerInfo$ = this._partnerInfo.asObservable();
	public state$ = this._state.asObservable();

	constructor(
    private _kalturaServerClient: KalturaClient
  ) {
	  this._loadData();
  }

	ngOnDestroy() {}

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
            }),
            pager: new KalturaFilterPager({
              pageSize: 25,
              pageIndex: 1
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
}

