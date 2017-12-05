import { Injectable } from '@angular/core';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { Observable } from 'rxjs/Observable';
import { UserGetAction } from 'kaltura-typescript-client/types/UserGetAction';
import { UserRoleGetAction } from 'kaltura-typescript-client/types/UserRoleGetAction';
import { UserUpdateLoginDataAction } from 'kaltura-typescript-client/types/UserUpdateLoginDataAction';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

@Injectable()
export class SettingsMyUserSettingsService {
  constructor(
    private _kalturaServerClient: KalturaClient
  ) {}

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
