import {Injectable, Optional, Inject} from '@angular/core';
import { InjectionToken } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {KalturaClient, KalturaMultiRequest, KalturaRequestOptions} from 'kaltura-ngx-client';
import {UserLoginByLoginIdAction} from 'kaltura-ngx-client/api/types/UserLoginByLoginIdAction';
import {UserGetByLoginIdAction} from 'kaltura-ngx-client/api/types/UserGetByLoginIdAction';
import {UserGetAction} from 'kaltura-ngx-client/api/types/UserGetAction';
import {PartnerGetInfoAction} from 'kaltura-ngx-client/api/types/PartnerGetInfoAction';
import {PermissionGetCurrentPermissionsAction} from 'kaltura-ngx-client/api/types/PermissionGetCurrentPermissionsAction';
import * as Immutable from 'seamless-immutable';
import {AppUser, PartnerInfo} from './app-user';
import {AppStorage} from '@kaltura-ng/kaltura-common';
import {UserResetPasswordAction} from 'kaltura-ngx-client/api/types/UserResetPasswordAction';
import {AdminUserUpdatePasswordAction} from 'kaltura-ngx-client/api/types/AdminUserUpdatePasswordAction';
import {UserLoginByKsAction} from 'app-shared/kmc-shell/auth/temp-user-logic-by-ks';
import { PageExitVerificationService } from 'app-shared/kmc-shell/page-exit-verification';

import { KalturaPartner } from 'kaltura-ngx-client/api/types/KalturaPartner';
import { KalturaUser } from 'kaltura-ngx-client/api/types/KalturaUser';
import { AppPermissionsService } from '@kaltura-ng/mc-shared';

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

export interface AppAuthenticationEvents {
    onUserLoggedIn: (appUser: Immutable.ImmutableObject<AppUser>) => Observable<void>;
    onUserLoggedOut: () => void;
}
export const APP_AUTH_EVENTS = new InjectionToken<AppAuthenticationEvents>('App Authentication Events');


@Injectable()
export class AppAuthentication {

    private _appUser: Immutable.ImmutableObject<AppUser> = null;

    constructor(private kalturaServerClient: KalturaClient,
                @Inject(APP_AUTH_EVENTS) private _appAuthenticationEvents: AppAuthenticationEvents,
                private appStorage: AppStorage,
                private _pageExitVerificationService: PageExitVerificationService) {
    }

    private _getLoginErrorMessage({error}): ILoginError {
        const message = (error ? error.message : null) || 'Failed to load partner information';
        const code = error ? error.code : null;
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
            };
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

    get appUser(): Immutable.ImmutableObject<AppUser> {
        return this._appUser;
    }

    resetPassword(email: string): Observable<void> {
        if (this.isLogged()) {
            return this.kalturaServerClient.request(new UserResetPasswordAction({email}));
        } else {
            return Observable.throw(new Error('cannot reset password, user is not logged'));
        }
    }

    updatePassword(payload: IUpdatePasswordPayload): Observable<{ email: string, password: string }> {
        if (this.isLogged()) {
            return this.kalturaServerClient.request(new AdminUserUpdatePasswordAction(payload))
                .catch(error => Observable.throw(this._getLoginErrorMessage({error})));
        } else {
            return Observable.throw(new Error('cannot update password, user is not logged'));
        }
    }

    login(loginId: string, password: string, optional: { privileges?, expiry? } = {
        privileges: '',
        expiry: 86400
    }): Observable<ILoginResponse> {

        const expiry = (optional ? optional.expiry : null) || 86400;
        const privileges = optional ? optional.privileges : '';

        this.appStorage.removeFromSessionStorage('auth.login.ks');  // clear session storage

        const request = new KalturaMultiRequest(
            new UserLoginByLoginIdAction(
                {
                    loginId,
                    password,

                    expiry: expiry,
                    privileges: privileges
                }),
            new UserGetByLoginIdAction({loginId})
                .setRequestOptions(
                    new KalturaRequestOptions({})
                        .setDependency(['ks', 0])),
            new PartnerGetInfoAction({}).setRequestOptions(
                new KalturaRequestOptions({})
                    .setDependency(['ks', 0])
                    .setDependency(['id', 1, 'partnerId'])
            ),
            <any>new PermissionGetCurrentPermissionsAction({}).setRequestOptions(
                new KalturaRequestOptions({})
                    .setDependency(['ks', 0])),
        );

        return <any>(this.kalturaServerClient.multiRequest(request)
            .switchMap(
                response => {
                    if (!response.hasErrors()) {
                        return this._afterLogin(response[0].result, response[1].result, response[2].result, response[3].result)
                            .map(() => {
                                return {success: true, error: null};
                            });
                    }

                    return Observable.of({success: false, error: this._getLoginErrorMessage(response[0])});
                }
            ));
    }

    private _afterLogin(ks: string, user: KalturaUser, partner: KalturaPartner, permissionsFlags: string): Observable<void> {

        this.appStorage.setInSessionStorage('auth.login.ks', ks);  // save ks in session storage

        const appUser: Immutable.ImmutableObject<AppUser> = Immutable({
            ks,
            id: user.id,
            partnerId: user.partnerId,
            fullName: user.fullName,
            firstName: user.firstName,
            lastName: user.lastName,
            isAccountOwner: user.isAccountOwner,
            createdAt: user.createdAt,
            permissions: permissionsFlags ? permissionsFlags.split(',') : [],
            partnerInfo: {
                partnerId: user.partnerId,
                name: partner.name,
                partnerPackage: partner.partnerPackage,
                landingPage: partner.landingPage,
                adultContent: partner.adultContent
            }
        });

        return this._appAuthenticationEvents.onUserLoggedIn(appUser)
            .do(() => {
                this._appUser = appUser;
            });
    }

    isLogged() {
        return !!this._appUser;
    }

    logout() {
        this._appUser = null;
        this.appStorage.removeFromSessionStorage('auth.login.ks');
        this._logout();
    }

    public loginAutomatically(): Observable<boolean> {
        return Observable.create((observer: any) => {
            if (!this.isLogged()) {
                const loginToken = this.appStorage.getFromSessionStorage('auth.login.ks');  // get ks from session storage
                if (loginToken) {
                    const requests = [
                        new UserGetAction({}).setRequestOptions({
                            ks: loginToken

                        }),
                        new PartnerGetInfoAction({}).setRequestOptions({
                            ks: loginToken

                        })
                            .setDependency(['id', 0, 'partnerId']),
                        <any>new PermissionGetCurrentPermissionsAction({}).setRequestOptions({
                            ks: loginToken
                        })
                    ];

                    return this.kalturaServerClient.multiRequest(requests)
                        .switchMap((response) => {
                            return this._afterLogin(loginToken, response[0].result, response[1].result, response[2].result);
                        })
                        .subscribe(
                            () => {
                                observer.next(true);
                                observer.complete();
                            },
                            () => {
                                observer.next(false);
                                observer.complete();
                            }
                        );
                } else {
                    observer.next(false);
                    observer.complete();
                }
            }
        });
    }

    public switchPartnerId(partnerId: number): Observable<void> {
        return Observable.create((observer: any) => {
            return this.kalturaServerClient.request(new UserLoginByKsAction({requestedPartnerId: partnerId}))
                .subscribe(
                    result => {
                        this.appStorage.setInSessionStorage('auth.login.ks', result.ks);
                        this._logout();

                        // DEVELOPER NOTICE: observer next/complete not implemented by design
                        // (since we are breaking the stream by reloading the page)
                    },
                    error => {
                        observer.error(error);
                    }
                );
        });
    }

    public reload() {
        // reload page
        document.location.reload();
    }

    private _logout() {
        this._appAuthenticationEvents.onUserLoggedOut();
        this._pageExitVerificationService.removeAll();
        document.location.reload();
    }

    public _updateNameManually(firstName: string, lastName: string, fullName: string): void {
        if (this._appUser) {
            this._appUser = this._appUser.merge(
                {
                    firstName: firstName,
                    lastName: lastName,
                    fullName: fullName
                });
        }
    }
}
