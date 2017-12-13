import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaClient } from 'kaltura-ngx-client';
import { UserGetAction } from 'kaltura-ngx-client/api/types/UserGetAction';
import { UserRoleGetAction } from 'kaltura-ngx-client/api/types/UserRoleGetAction';
import { UserUpdateLoginDataAction } from 'kaltura-ngx-client/api/types/UserUpdateLoginDataAction';

@Injectable()
export class SettingsMyUserSettingsService {
  constructor(private _kalturaServerClient: KalturaClient) {
  }

  public getUserData(): Observable<any> {
    return this._kalturaServerClient.request(new UserGetAction())
      .catch(() => {
        return Observable.throw(new Error('Error occurred in action \'getUserData\''));
      })
  }

  public getRoleDescription(roleIds: string): Observable<any> {
    return this._kalturaServerClient.request(new UserRoleGetAction({ userRoleId: parseInt(roleIds) }))
      .catch(() => {
        return Observable.throw(new Error('Error occurred in action \'getRoleDescription\''));
      })
  }

  public updateLoginData(userData: any): Observable<any> {
    return this._kalturaServerClient.request(
      new UserUpdateLoginDataAction(userData)
    )
      .catch(error => {
        return Observable.throw(new Error(error && error.message ? error.message : 'Error occurred in action \'updateLoginData\''));
      })
  }
}
