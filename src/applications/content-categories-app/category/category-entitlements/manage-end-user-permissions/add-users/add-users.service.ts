import {Injectable} from '@angular/core';
import {KalturaClient, KalturaMultiRequest} from 'kaltura-ngx-client';
import {UserListAction} from 'kaltura-ngx-client/api/types/UserListAction';
import {KalturaUserFilter} from 'kaltura-ngx-client/api/types/KalturaUserFilter';
import {KalturaFilterPager} from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import {KalturaCategoryUserPermissionLevel} from 'kaltura-ngx-client/api/types/KalturaCategoryUserPermissionLevel';
import {Observable} from 'rxjs/Observable';
import {KalturaUpdateMethodType} from 'kaltura-ngx-client/api/types/KalturaUpdateMethodType';
import {CategoryUserAddAction} from 'kaltura-ngx-client/api/types/CategoryUserAddAction';
import {KalturaCategoryUser} from 'kaltura-ngx-client/api/types/KalturaCategoryUser';
import {AppLocalization} from '@kaltura-ng/kaltura-common';

@Injectable()
export class AddUsersService {

  constructor(private _kalturaServerClient: KalturaClient,
              private _appLocalization: AppLocalization) {
  }


  public addUsers({usersIds, categoryId, permissionLevel, updateMethod}: { usersIds: string[], categoryId: number, permissionLevel: KalturaCategoryUserPermissionLevel, updateMethod: KalturaUpdateMethodType}): Observable<void> {
    if (!usersIds || !usersIds.length) {
      return Observable.throw(
        new Error(this._appLocalization
          .get('applications.content.categoryDetails.entitlements.usersPermissions.addUsers.errors.missingUsers')));
    }

    const multiRequest = new KalturaMultiRequest();
    usersIds.forEach(userId => {
      const categoryUser = new KalturaCategoryUser({
        categoryId,
        userId,
        permissionLevel,
        updateMethod
      });
      multiRequest.requests.push(new CategoryUserAddAction({categoryUser}));
    });

    return this._kalturaServerClient.multiRequest(multiRequest)
      .map(response => {
          if (response.hasErrors()) {
            throw new Error(
              this._appLocalization
                .get('applications.content.categoryDetails.entitlements.usersPermissions.addUsers.errors.addUsersFailed'));
          }
          return undefined;
        }
      )
      .catch(err => Observable.throw(err));
  }

  public getUsersSuggestions(query: string) {
    return this._kalturaServerClient.request(
      new UserListAction(
        {
          filter: new KalturaUserFilter({
            idOrScreenNameStartsWith: query
          }),
          pager: new KalturaFilterPager({
            pageIndex: 0,
            pageSize: 30
          })
        }
      )
    );
  }
}
