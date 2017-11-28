import { Injectable } from '@angular/core';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { Observable } from 'rxjs/Observable';
import { UserGetAction } from 'kaltura-typescript-client/types/UserGetAction';
import { UserRoleGetAction } from 'kaltura-typescript-client/types/UserRoleGetAction';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

@Injectable()
export class SettingsMyUserSettingsService {
  constructor(
    private _kalturaServerClient: KalturaClient
  ) {}

  public getUserData(): Observable<any> {
    return this._kalturaServerClient.request(new UserGetAction())
      .map(
        user => {
          return {user};
        })
      .catch(() => {
        return Observable.throw(new Error('Error occurred in action \'getUserData\''));
      })
  }

  public getRoleDescription(roleIds: string): any {
    return this._kalturaServerClient.request(new UserRoleGetAction(
      {
        userRoleId: parseInt(roleIds)
      }
    ))
      .map(
        role => {
          return {role};
        })
      .catch(() => {
        return Observable.throw(new Error('Error occurred in action \'getRoleDescription\''));
      })
  }
}
