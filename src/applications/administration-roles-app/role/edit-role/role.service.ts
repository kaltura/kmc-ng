import {Injectable, OnDestroy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {KalturaClient} from '@kaltura-ng/kaltura-client';
import {KalturaUserRole} from 'kaltura-typescript-client/types/KalturaUserRole';
import {UserRoleUpdateAction} from 'kaltura-typescript-client/types/UserRoleUpdateAction';
import {UserRoleAddAction} from 'kaltura-typescript-client/types/UserRoleAddAction';

@Injectable()
export class RoleService implements OnDestroy {

  constructor(private _kalturaClient: KalturaClient) {
  }

  ngOnDestroy() {
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

    return this._kalturaClient.request(new UserRoleAddAction({userRole: role}))
      .map(() => {
        return;
      });
  }
}

