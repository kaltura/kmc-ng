import {Injectable, Optional, Inject} from '@angular/core';
import { InjectionToken } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import * as R from 'ramda';
import {KalturaClient, KalturaMultiRequest} from 'kaltura-ngx-client';
import {KalturaPermissionFilter} from 'kaltura-ngx-client/api/types/KalturaPermissionFilter';
import {UserLoginByLoginIdAction} from 'kaltura-ngx-client/api/types/UserLoginByLoginIdAction';
import {UserGetByLoginIdAction} from 'kaltura-ngx-client/api/types/UserGetByLoginIdAction';
import {UserGetAction} from 'kaltura-ngx-client/api/types/UserGetAction';
import {PermissionListAction} from 'kaltura-ngx-client/api/types/PermissionListAction';
import {PartnerGetInfoAction} from 'kaltura-ngx-client/api/types/PartnerGetInfoAction';
import {PermissionGetCurrentPermissionsAction} from 'kaltura-ngx-client/api/types/PermissionGetCurrentPermissionsAction';

import {AppUser} from './app-user';
import {AppStorage} from '@kaltura-ng/kaltura-common';
import {PartnerInfo} from './partner-info';
import {UserResetPasswordAction} from 'kaltura-ngx-client/api/types/UserResetPasswordAction';
import {AdminUserUpdatePasswordAction} from 'kaltura-ngx-client/api/types/AdminUserUpdatePasswordAction';
import {UserLoginByKsAction} from 'app-shared/kmc-shell/auth/temp-user-logic-by-ks';
import { PageExitVerificationService } from 'app-shared/kmc-shell/page-exit-verification';
import { KmcServerPolls } from 'app-shared/kmc-shared';
import { globalConfig } from 'config/global';
import { NgxPermissionsService } from 'ngx-permissions';
import { KalturaPartner } from 'kaltura-ngx-client/api/types/KalturaPartner';
import { KalturaPermission } from 'kaltura-ngx-client/api/types/KalturaPermission';
import { KalturaUser } from 'kaltura-ngx-client/api/types/KalturaUser';


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
    error: ILoginError;
}

export interface AuthenticationPostEvents {
    onUserLogIn?: () => Observable<void>;
}
export let AUTH_POST_EVENTS = new InjectionToken<AuthenticationPostEvents>('AUTH_POST_EVENTS');


@Injectable()
export class AppAuthentication {

    private _appUser: AppUser;
    private _appAuthStatus = new BehaviorSubject<AppAuthStatusTypes>(AppAuthStatusTypes.UserLoggedOut);

    appEvents$ = this._appAuthStatus.asObservable();


    constructor(private kalturaServerClient: KalturaClient,
                @Optional() @Inject(AUTH_POST_EVENTS) private _authenticationPostEvents: AuthenticationPostEvents,
                private appStorage: AppStorage,
                private _permissions: NgxPermissionsService,
                private _serverPolls: KmcServerPolls,
                private _permissionsService: NgxPermissionsService,
                private _pageExitVerificationService: PageExitVerificationService) {
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

        const partnerId = globalConfig.kalturaServer.limitToPartnerId || undefined;
        const request = new KalturaMultiRequest(
            new UserLoginByLoginIdAction(
                {
                    loginId,
                    password,
                    partnerId,
                    expiry: expiry,
                    privileges: privileges
                }),
            new UserGetByLoginIdAction({loginId, partnerId,
                ks: '{1:result}'}),
            new PermissionListAction(
                {
                    filter: permissionFilter,
                    partnerId,
                    ks: '{1:result}'
                }
            ),
            new PartnerGetInfoAction({
                partnerId,
                ks: '{1:result}'
            })
                .setDependency(['id', 1, 'partnerId'])
            ,
            <any>new PermissionGetCurrentPermissionsAction({
                partnerId,
                ks: '{1:result}'
            })
        );

        return <any>(this.kalturaServerClient.multiRequest(request)
            .switchMap(
                response => {
                    if (!response.hasErrors()) {
                        return this._afterLogin(response[0].result, response[1].result, response[2].result.objects, response[3].result, response[4].result)
                            .map(() =>
                            {
                                return {success: true, error: null};
                            });
                    }

                    const [loginResponse] = response;
                    return Observable.of({success: false, error: this._getLoginErrorMessage(loginResponse)});
                }
            ));
    }

    private _afterLogin(ks: string, user: KalturaUser, permissionsList: KalturaPermission[], partner: KalturaPartner, permissionsFlags: string): Observable<void> {

        const generalProperties = R.pick([
            'id', 'partnerId', 'fullName', 'firstName', 'lastName', 'roleIds', 'roleNames', 'isAccountOwner'
        ])(user);
        this.appUser.permissions = R.map(R.pick(['id', 'type', 'name', 'status']))(permissionsList);
        const partnerProperties: any = R.pick(['name', 'partnerPackage', 'landingPage'])(partner);

        // TODO [kmc] check if ks should be stored in appUser and remove direct call to http configuration
        this.kalturaServerClient.ks = ks;
        this.appUser.ks = ks;

        const permissionsFlagsList = permissionsFlags ? permissionsFlags.split(',') : [];
        this._permissions.loadPermissions(permissionsFlagsList);

        this.kalturaServerClient.ks = this.appUser.ks;
        this.kalturaServerClient.partnerId = this.appUser.partnerId;

        this.appUser.partnerInfo = new PartnerInfo(
            partnerProperties.name,
            partnerProperties.partnerPackage,
            partnerProperties.landingPage,
            partnerProperties.adultContent
        );
        Object.assign(this.appUser, generalProperties);

        this.appStorage.setInSessionStorage('auth.login.ks', ks);  // save ks in session storage

        this._appAuthStatus.next(AppAuthStatusTypes.UserLoggedIn);
        this._serverPolls.forcePolling(); // TODO kmcng move app.module

        const postLogInEvent = this._authenticationPostEvents && this._authenticationPostEvents.onUserLogIn ? this._authenticationPostEvents.onUserLogIn() : Observable.of(undefined);
        return postLogInEvent;
    }

    isLogged() {
        return this._appAuthStatus.getValue() === AppAuthStatusTypes.UserLoggedIn;
    }

    logout() {
        this.appUser.ks = null;
        this.kalturaServerClient.ks = null;

        this._permissions.flushPermissions();

        this.appStorage.removeFromSessionStorage('auth.login.ks');

        this._appAuthStatus.next(AppAuthStatusTypes.UserLoggedOut);
        this.forceReload();
    }

    public loginAutomatically(): Observable<boolean> {
        return Observable.create((observer: any) => {
            if (this._appAuthStatus.getValue() === AppAuthStatusTypes.UserLoggedOut) {
                const loginToken = this.appStorage.getFromSessionStorage('auth.login.ks');  // get ks from session storage
                if (loginToken) {
                    const partnerId = globalConfig.kalturaServer.limitToPartnerId || undefined;

                    const requests = [
                        new UserGetAction({
                            ks: loginToken,
                            partnerId
                        }),
                        new PermissionListAction(
                            {
                                ks: loginToken,
                                partnerId,
                                filter: new KalturaPermissionFilter({
                                    nameEqual: 'FEATURE_DISABLE_REMEMBER_ME'
                                })
                            }
                        ),
                        new PartnerGetInfoAction({
                            ks: loginToken,
                            partnerId
                        })
                            .setDependency(['id', 0, 'partnerId']),
                        <any>new PermissionGetCurrentPermissionsAction({
                            partnerId,
                            ks: loginToken // we must set the ks manually, only upon successful result we will update the global module
                        })
                    ];

                    return this.kalturaServerClient.multiRequest(requests)
                        .switchMap((response) => {
                            return this._afterLogin(loginToken, response[0].result, response[1].result.objects, response[2].result, response[3].result);
                        })
                        .subscribe(
                            () => {
                                observer.next(true);
                                observer.complete();
                            },
                            () => {
                                observer.next(false);
                                observer.complete();
                                this._appAuthStatus.next(AppAuthStatusTypes.UserLoggedOut); // TODO [kmcng] remove
                            }
                        );
                } else {
                    observer.next(false);
                    observer.complete();
                    this._appAuthStatus.next(AppAuthStatusTypes.UserLoggedOut); // TODO [kmcng] remove
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
        this._pageExitVerificationService.removeAll();
        this.reload();
    }

    // Hack to update user name in the header
    public _updateNameManually(firstName: string, lastName: string, fullName: string): void {
        if (firstName && lastName) {
            this._appUser.firstName = firstName;
            this._appUser.lastName = lastName;
            this._appUser.fullName = fullName;
        } else {
            throw Error('Cannot update the current user. The first, the last name or the fullName is not provided');
        }
    }
}
