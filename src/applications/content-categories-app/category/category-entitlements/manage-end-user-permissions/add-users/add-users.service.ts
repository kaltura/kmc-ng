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
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import {CategoryUserCopyFromCategoryAction} from "kaltura-ngx-client/api/types/CategoryUserCopyFromCategoryAction";
import 'rxjs/add/operator/delay';

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
            const errorMessage = (response.find(r => (r.error && r.error.code !== 'CATEGORY_USER_ALREADY_EXISTS'))) ?
                'applications.content.categoryDetails.entitlements.usersPermissions.addUsers.errors.addUsersFailed':
                'applications.content.categoryDetails.entitlements.usersPermissions.addUsers.errors.duplicateUsers';
            throw new Error(this._appLocalization.get(errorMessage));
          }
          return undefined;
        }
      )
      .catch(err => Observable.throw(err));
  }



  public copyUsersFromParent({categoryId}: {categoryId: number}): Observable<void> {
    return this._kalturaServerClient.request(
      new CategoryUserCopyFromCategoryAction({categoryId})
    ).delay(6000); // we delay the response for the server to be able to index the new users
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
