import {Injectable} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import * as R from 'ramda';
import {KalturaClient} from '@kaltura-ng/kaltura-client';

import {KalturaMultiRequest} from 'kaltura-typescript-client';
import {KalturaPermissionFilter} from 'kaltura-typescript-client/types/KalturaPermissionFilter';
import {UserLoginByLoginIdAction} from 'kaltura-typescript-client/types/UserLoginByLoginIdAction';
import {UserGetByLoginIdAction} from 'kaltura-typescript-client/types/UserGetByLoginIdAction';
import {UserGetAction} from 'kaltura-typescript-client/types/UserGetAction';
import {PermissionListAction} from 'kaltura-typescript-client/types/PermissionListAction';
import {PartnerGetInfoAction} from 'kaltura-typescript-client/types/PartnerGetInfoAction';
import {PermissionGetCurrentPermissionsAction} from 'kaltura-typescript-client/types/PermissionGetCurrentPermissionsAction';

import {AppUser} from './app-user';
import {AppStorage} from '@kaltura-ng/kaltura-common';
import {PartnerInfo} from './partner-info';
import {UserResetPasswordAction} from 'kaltura-typescript-client/types/UserResetPasswordAction';
import {AdminUserUpdatePasswordAction} from 'kaltura-typescript-client/types/AdminUserUpdatePasswordAction';
import {UserLoginByKsAction} from 'app-shared/kmc-shell/auth/temp-user-logic-by-ks';
import { BrowserService } from '../providers/browser.service';



export enum AppAuthStatusTypes {
  UserLoggedIn,
  UserLoggedOut
}

export interface IUpdatePasswordPayload {
  email: string;
  password: string;
  newEmail: string;
  newPassword: string;
}

export interface ILoginError {
  message: string;
  custom: boolean;
  passwordExpired?: boolean;
  code?: string;
}

export interface ILoginResponse {
  success: boolean;
  error: ILoginError
}

@Injectable()
export class AppAuthentication {

  private _appUser: AppUser;
  private _appAuthStatus = new BehaviorSubject<AppAuthStatusTypes>(AppAuthStatusTypes.UserLoggedOut);

  appEvents$ = this._appAuthStatus.asObservable();

  defaultRoutes = {
    loginRoute: '',
    defaultRoute: '',
    errorRoute: ''
  };

  constructor(private kalturaServerClient: KalturaClient,
              private appStorage: AppStorage,
              private browserService: BrowserService) {
    this._appUser = new AppUser();
  }

  private _getLoginErrorMessage({error}): ILoginError {
    const {message, code} = error;
    const custom = true;
    const errors = {
      'USER_NOT_FOUND': 'app.login.error.badCredentials',
      'USER_WRONG_PASSWORD': 'app.login.error.badCredentials',
      'LOGIN_RETRIES_EXCEEDED': 'app.login.error.retriesExceeded',
      'ADMIN_KUSER_NOT_FOUND': 'app.login.error.userNotFound',
      'PASSWORD_STRUCTURE_INVALID': 'app.login.error.invalidStructure',
      'PASSWORD_ALREADY_USED': 'app.login.error.alreadyUsed',
      'LOGIN_BLOCKED': 'app.login.error.loginBlocked',
      'NEW_PASSWORD_HASH_KEY_INVALID': 'app.login.error.newPasswordHashKeyInvalid',
      'NEW_PASSWORD_HASH_KEY_EXPIRED': 'app.login.error.newPasswordHashKeyExpired',
      'ADMIN_KUSER_WRONG_OLD_PASSWORD': 'app.login.error.wrongOldPassword',
      'WRONG_OLD_PASSWORD': 'app.login.error.wrongOldPassword',
      'INVALID_FIELD_VALUE': 'app.login.error.invalidField'
    };

    if (code === 'PASSWORD_EXPIRED') {
      return {
        message: '',
        custom: false,
        passwordExpired: true,
        code
      }
    }

    if (code in errors) {
      return {
        message: errors[code],
        custom: false,
        code
      };
    }

    return {message, custom, code};
  }

  get currentAppEvent(): AppAuthStatusTypes {
    return this._appAuthStatus.getValue();
  }

  get appUser(): AppUser {
    return this._appUser;
  }

  resetPassword(email: string): Observable<void> {
    return this.kalturaServerClient.request(new UserResetPasswordAction({email}));
  }

  updatePassword(payload: IUpdatePasswordPayload): Observable<{ email: string, password: string }> {
    return this.kalturaServerClient.request(new AdminUserUpdatePasswordAction(payload))
      .catch(error => Observable.throw(this._getLoginErrorMessage({error})));
  }

  login(loginId: string, password: string, optional: { privileges?, expiry? } = {
    privileges: '',
    expiry: 86400
  }): Observable<ILoginResponse> {

    const expiry = (optional ? optional.expiry : null) || 86400;
    const privileges = optional ? optional.privileges : '';

    this.appStorage.removeFromSessionStorage('auth.login.ks');  // clear session storage

    const permissionFilter = new KalturaPermissionFilter();
    permissionFilter.nameEqual = 'FEATURE_DISABLE_REMEMBER_ME';


    const request = new KalturaMultiRequest(
      new UserLoginByLoginIdAction(
        {
          loginId,
          password,
          expiry: expiry,
          privileges: privileges
        }),
      new UserGetByLoginIdAction({loginId, ks: '{1:result}'}),
      new PermissionListAction(
        {
          filter: permissionFilter,
          ks: '{1:result}'
        }
      ),
      new PartnerGetInfoAction({
        ks: '{1:result}'
      })
        .setDependency(['id', 1, 'partnerId'])
      ,

      <any>new PermissionGetCurrentPermissionsAction({
        ks: '{1:result}'
      })
    );

    return <any>(this.kalturaServerClient.multiRequest(request).map(
      response => {
        if (!response.hasErrors()) {
          const ks = response[0].result;
          const generalProperties = R.pick([
            'id', 'partnerId', 'fullName', 'firstName', 'lastName', 'roleIds', 'roleNames', 'isAccountOwner'
          ])(response[1].result);
          const permissions = R.map(R.pick(['id', 'type', 'name', 'status']))(response[2].result.objects);
          const partnerProperties: any = R.pick(['name', 'partnerPackage', 'landingPage'])(response[3].result);
          const permissionsFlags: any = response[4].result;


          // TODO [kmc] check if ks should be stored in appUser and remove direct call to http configuration
          this.kalturaServerClient.ks = ks;
          this.appUser.ks = ks;
          this.appUser.permissions = permissions;
          this.appUser.permissionsFlags = permissionsFlags ? permissionsFlags.split(',') : [];
          this.appUser.partnerInfo = new PartnerInfo(
            partnerProperties.name,
            partnerProperties.partnerPackage,
            partnerProperties.landingPage
          );
          Object.assign(this.appUser, generalProperties);

          const value = `${ks}`;
          this.appStorage.setInSessionStorage('auth.login.ks', value);  // save ks in session storage

          this._appAuthStatus.next(AppAuthStatusTypes.UserLoggedIn);

          return {success: true, error: null};
        }

        const [loginResponse] = response;
        return {success: false, error: this._getLoginErrorMessage(loginResponse)};
      }
    ));
  }

  isLogged() {
    return this._appAuthStatus.getValue() === AppAuthStatusTypes.UserLoggedIn;
  }

  logout() {
    this.appUser.ks = null;
    this.kalturaServerClient.ks = null;

    this.appStorage.removeFromSessionStorage('auth.login.ks');

    this._appAuthStatus.next(AppAuthStatusTypes.UserLoggedOut);
    this.forceReload();
  }

  public loginAutomatically(): Observable<boolean> {
    return Observable.create((observer: any) => {
      if (this._appAuthStatus.getValue() === AppAuthStatusTypes.UserLoggedOut) {
        const loginToken = this.appStorage.getFromSessionStorage('auth.login.ks');  // get ks from session storage
        if (loginToken) {
          const requests = [
            new UserGetAction({
              ks: loginToken
            }),
            new PermissionListAction(
              {
                ks: loginToken,
                filter: new KalturaPermissionFilter({
                  nameEqual: 'FEATURE_DISABLE_REMEMBER_ME'
                })
              }
            ),
            new PartnerGetInfoAction({
              ks: loginToken
            })
              .setDependency(['id', 0, 'partnerId']),
            <any>new PermissionGetCurrentPermissionsAction({
              ks: loginToken // we must set the ks manually, only upon successful result we will update the global module
            })
          ];

          return this.kalturaServerClient.multiRequest(requests).map(
            (results) => {
              // TODO [kmc] this logic is duplicated to the login process.
              const generalProperties = R.pick([
                'id', 'partnerId', 'fullName', 'firstName', 'lastName', 'roleIds', 'roleNames', 'isAccountOwner'
              ])(results[0].result);
              const permissions = R.map(R.pick(['id', 'type', 'name', 'status']))(results[1].result.objects);
              const partnerProperties: any = R.pick(['name', 'partnerPackage', 'landingPage'])(results[2].result);
              const permissionsFlags: any = results[3].result;

              this.appUser.ks = loginToken;
              this.appUser.permissions = permissions;
              this.appUser.permissionsFlags = permissionsFlags ? permissionsFlags.split(',') : [];
              this.appUser.partnerInfo = new PartnerInfo(
                partnerProperties.name,
                partnerProperties.partnerPackage,
                partnerProperties.landingPage
              );
              Object.assign(this.appUser, generalProperties);

              this.appStorage.setInSessionStorage('auth.login.ks', loginToken);  // save ks in session storage

              return true;
            }).subscribe(
            () => {
              this._appAuthStatus.next(AppAuthStatusTypes.UserLoggedIn);
              observer.next(true);
              observer.complete();
            },
            () => {
              observer.next(false);
              observer.complete();
              this._appAuthStatus.next(AppAuthStatusTypes.UserLoggedOut);
            }
          );
        } else {
          observer.next(false);
          observer.complete();
          this._appAuthStatus.next(AppAuthStatusTypes.UserLoggedOut);
        }
      }
    });
  }

  public loginByKs(requestedPartnerId: number): Observable<void> {
    return Observable.create((observer: any) => {
      return this.kalturaServerClient.request(new UserLoginByKsAction({requestedPartnerId}))
        .subscribe(
          result => {
            const ks = result.ks;
            this.appUser.ks = ks;
            this.appStorage.setInSessionStorage('auth.login.ks', ks);
            this.forceReload();

            // observer next/complete not implemented by design (since we are breaking the stream by reloading the page)
          },
          error => {
            observer.error(error);
          }
        );
    });
  }

  // reload page
  public reload() {
    document.location.reload();
  }

  // Prevents the browser to verify page exit before reload
  private forceReload() {
    this.browserService.disablePageExitVerification();
    this.reload();
  }
}
