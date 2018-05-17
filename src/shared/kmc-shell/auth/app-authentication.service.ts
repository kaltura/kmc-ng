import {Injectable, Optional, Inject} from '@angular/core';
import { Location } from '@angular/common';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {KalturaClient, KalturaMultiRequest, KalturaRequestOptions} from 'kaltura-ngx-client';
import {UserLoginByLoginIdAction} from 'kaltura-ngx-client/api/types/UserLoginByLoginIdAction';
import {UserGetByLoginIdAction} from 'kaltura-ngx-client/api/types/UserGetByLoginIdAction';
import {UserGetAction} from 'kaltura-ngx-client/api/types/UserGetAction';
import {PartnerGetInfoAction} from 'kaltura-ngx-client/api/types/PartnerGetInfoAction';
import {PermissionListAction} from 'kaltura-ngx-client/api/types/PermissionListAction';
import {KalturaResponseProfileType} from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';
import {KalturaDetachedResponseProfile} from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import {KalturaPermissionFilter} from 'kaltura-ngx-client/api/types/KalturaPermissionFilter';
import {KalturaPermissionListResponse} from 'kaltura-ngx-client/api/types/KalturaPermissionListResponse';
import {KalturaUserRole} from 'kaltura-ngx-client/api/types/KalturaUserRole';
import {KalturaFilterPager} from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import {KalturaPermissionStatus} from 'kaltura-ngx-client/api/types/KalturaPermissionStatus';
import {UserRoleGetAction} from 'kaltura-ngx-client/api/types/UserRoleGetAction';
import * as Immutable from 'seamless-immutable';
import {AppUser} from './app-user';
import {UserResetPasswordAction} from 'kaltura-ngx-client/api/types/UserResetPasswordAction';
import {AdminUserUpdatePasswordAction} from 'kaltura-ngx-client/api/types/AdminUserUpdatePasswordAction';
import { PageExitVerificationService } from 'app-shared/kmc-shell/page-exit-verification/page-exit-verification.service';
import { UserLoginStatusEvent } from 'app-shared/kmc-shared/events';
import { KalturaPartner } from 'kaltura-ngx-client/api/types/KalturaPartner';
import { KalturaUser } from 'kaltura-ngx-client/api/types/KalturaUser';
import { AppEventsService } from 'app-shared/kmc-shared/app-events';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { serverConfig } from 'config/server';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { UserLoginByKsAction } from 'kaltura-ngx-client/api/types/UserLoginByKsAction';
import { KmcServerPolls } from '../../kmc-shared/server-polls';
import { HttpClient } from '@angular/common/http';
import { buildKalturaServerUri } from 'config/server';
import { KmcMainViewsService } from 'app-shared/kmc-shared/kmc-views/kmc-main-views.service';
import { kmcAppConfig } from '../../../kmc-app/kmc-app-config';
const ksSessionStorageKey = 'auth.login.ks';

export interface UpdatePasswordPayload {
    email: string;
    password: string;
    newEmail: string;
    newPassword: string;
}

export interface LoginError {
    message: string;
    custom: boolean;
    passwordExpired?: boolean;
    closedForBeta?: boolean;
    code?: string;
}

export interface LoginResponse {
    success: boolean;
    error: LoginError;
}

export interface AppAuthenticationEvents {
    onUserLoggedIn: (appUser: Immutable.ImmutableObject<AppUser>) => Observable<void>;
    onUserLoggedOut: () => void;
}
export enum AutomaticLoginErrorReasons {
    closedForBeta
};

@Injectable()
export class AppAuthentication {

    private _automaticLoginErrorReason: AutomaticLoginErrorReasons = null;

    public get automaticLoginErrorReason(): AutomaticLoginErrorReasons {
        return this._automaticLoginErrorReason;
    }

    private _automaticLoginCredentials: { ks: string} = null;
    private _logger: KalturaLogger;
    private _appUser: Immutable.ImmutableObject<AppUser> = null;


    constructor(private kalturaServerClient: KalturaClient,
                private _browserService: BrowserService,
                private _pageExitVerificationService: PageExitVerificationService,
                logger: KalturaLogger,
                private _serverPolls: KmcServerPolls,
                private _permissionsService: KMCPermissionsService,
                private _http: HttpClient,
                private _appEvents: AppEventsService,
                private _location: Location,
                private _kmcViewsManager: KmcMainViewsService) {
        this._logger = logger.subLogger('AppAuthentication');
    }

    private _getLoginErrorMessage({error}): LoginError {
        const message = (error ? error.message : null) || 'Failed to load partner information';
        const code = error ? error.code : null;
        const custom = true;
        const errors = {
            'USER_NOT_FOUND': 'app.login.error.badCredentials',
            'USER_WRONG_PASSWORD': 'app.login.error.badCredentials',
            'ADMIN_KUSER_NOT_FOUND': 'app.login.error.userNotFound',
            'PASSWORD_STRUCTURE_INVALID': 'app.login.error.invalidStructure',
            'PASSWORD_ALREADY_USED': 'app.login.error.alreadyUsed',
            'NEW_PASSWORD_HASH_KEY_INVALID': 'app.login.error.newPasswordHashKeyInvalid',
            'NEW_PASSWORD_HASH_KEY_EXPIRED': 'app.login.error.newPasswordHashKeyExpired',
            'ADMIN_KUSER_WRONG_OLD_PASSWORD': 'app.login.error.wrongOldPassword',
            'WRONG_OLD_PASSWORD': 'app.login.error.wrongOldPassword',
            'INVALID_FIELD_VALUE': 'app.login.error.invalidField',
            'USER_FORBIDDEN_FOR_BETA': 'app.login.error.userForbiddenForBeta'
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
        if (!this.isLogged()) {
            return this.kalturaServerClient.request(new UserResetPasswordAction({email}));
        } else {
            return Observable.throw(new Error('cannot reset password, user is logged'));
        }
    }

    updatePassword(payload: UpdatePasswordPayload): Observable<{ email: string, password: string }> {
        if (this.isLogged()) {
            return this.kalturaServerClient.request(new AdminUserUpdatePasswordAction(payload))
                .catch(error => Observable.throw(this._getLoginErrorMessage({error})));
        } else {
            return Observable.throw(new Error('cannot update password, user is not logged'));
        }
    }

    login(loginId: string, password: string): Observable<LoginResponse> {

        const expiry = kmcAppConfig.kalturaServer.expiry;
        let privileges = kmcAppConfig.kalturaServer.privileges || '';

        if (serverConfig.kalturaServer.defaultPrivileges) {
            privileges += `${privileges ? ',' : ''}${serverConfig.kalturaServer.defaultPrivileges}`;
        }

        this._automaticLoginErrorReason = null;
        this._browserService.removeFromSessionStorage(ksSessionStorageKey);  // clear session storage

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
                        .setDependency(['ks', 0])
                ),
            new PartnerGetInfoAction({}).setRequestOptions(
                new KalturaRequestOptions({})
                    .setDependency(['ks', 0])
                    .setDependency(['id', 1, 'partnerId'])
            ),
            new UserRoleGetAction({userRoleId: 0})
                .setRequestOptions(
                    new KalturaRequestOptions({})
                        .setDependency(['ks', 0])
                )
                .setDependency(['userRoleId', 1, 'roleIds']),
            new PermissionListAction({
                filter: new KalturaPermissionFilter({
                    statusEqual: KalturaPermissionStatus.active,
                    typeIn: '2,3'
                }),
                pager: new KalturaFilterPager({
                    pageSize: 500
                })
            })
                .setRequestOptions(
                    new KalturaRequestOptions({
                        responseProfile: new KalturaDetachedResponseProfile({
                            type: KalturaResponseProfileType.includeFields,
                            fields: 'name'
                        })
                    })
                        .setDependency(['ks', 0])
                )
        );

        return <any>(this.kalturaServerClient.multiRequest(request)
            .switchMap(
                response => {
                    if (!response.hasErrors()) {
                        return this._checkIfPartnerCanAccess(response[2].result);
                    } else {
                        return Observable.of(true); // errors will be handled by the map function
                    }
                },
                (response, isPartnerAllowed) => ({ response, isPartnerAllowed })
            )
            .map(
                ({ response, isPartnerAllowed }) => {
                    if (!response.hasErrors()) {
                        if (isPartnerAllowed) {
                            this._afterLogin(response[0].result, true, response[1].result, response[2].result, response[3].result, response[4].result);
                            return { success: true, error: null };
                        } else {
                            return {
                                success: false, error: {
                                    message: 'app.login.error.userForbiddenForBeta',
                                    custom: false,
                                    closedForBeta: true
                                }
                            };
                        }
                    }

                    return { success: false, error: this._getLoginErrorMessage(response[0]) };
                }
            )
        );
    }

    private _checkIfPartnerCanAccess(partner: KalturaPartner): Observable<boolean> {
        if (!(!!serverConfig.kalturaServer.login && !!serverConfig.kalturaServer.login.limitAccess)){
            return Observable.of(true);
        }
        const limitAccess = serverConfig.kalturaServer.login.limitAccess;

        if (!limitAccess.enabled) {
            return Observable.of(true);
        }

        const url = buildKalturaServerUri(limitAccess.verifyBetaServiceUrl + partner.id);
        this._logger.debug(`check if partner can access the KMC`, {partnerId: partner.id, limitAccess: true, url});

        return this._http.get(url, { responseType: 'json' })
            .map(res => {
                const {isPartnerPartOfBeta: canPartnerAccess} = <any>res;

                this._automaticLoginErrorReason = canPartnerAccess ? null : AutomaticLoginErrorReasons.closedForBeta;
                this._logger.info(`query service to check if partner can access the KMC`, {
                    partnerId: partner.id,
                    canPartnerAccess
                });
                return canPartnerAccess;
            })
            .catch((e) => {
                this._logger.error('Failed to check if partner can access the KMC', e);
                throw Error('Failed to check if partner can access the KMC');
            });
    }

    private _afterLogin(ks: string, storeCredentialsInSessionStorage: boolean, user: KalturaUser, partner: KalturaPartner, userRole: KalturaUserRole, permissionList: KalturaPermissionListResponse): void {

        if (storeCredentialsInSessionStorage) {
            this._browserService.setInSessionStorage(ksSessionStorageKey, ks);  // save ks in session storage
        }

        const partnerPermissionList = permissionList.objects.map(item => item.name);
        const userRolePermissionList = userRole.permissionNames.split(',');
        this._permissionsService.load(userRolePermissionList, partnerPermissionList);

        const appUser: Immutable.ImmutableObject<AppUser> = Immutable({
            ks,
            id: user.id,
            partnerId: user.partnerId,
            fullName: user.fullName,
            firstName: user.firstName,
            lastName: user.lastName,
            isAccountOwner: user.isAccountOwner,
            createdAt: user.createdAt,
            partnerInfo: {
                partnerId: user.partnerId,
                name: partner.name,
                partnerPackage: partner.partnerPackage,
                landingPage: partner.landingPage,
                adultContent: partner.adultContent,
                publisherEnvironmentType: partner.publisherEnvironmentType
            }
        });

        this._kmcViewsManager.rebuildMenu();
        this.kalturaServerClient.setDefaultRequestOptions({
            ks: appUser.ks
        });
        window['kmcng'] = {ks};

        this._appUser = appUser;
        this._appEvents.publish(new UserLoginStatusEvent(true));

        this._serverPolls.forcePolling();
    }

    isLogged() {
        return !!this._appUser;
    }

    private _clearSessionCredentials(): void {
        this._logger.debug(`clear previous stored credentials in session storage if found`);
        this._browserService.removeFromSessionStorage(ksSessionStorageKey);
    }

    logout() {
        this._logger.info('handle logout request by the user');
        this._clearSessionCredentials();
        this._logout();
    }

    private _loginByKS(loginToken: string, storeCredentialsInSessionStorage): Observable<boolean> {
        return Observable.create((observer: any) => {
            if (!this.isLogged()) {
                if (loginToken) {
                    const requests = [
                        new UserGetAction({})
                            .setRequestOptions({
                                ks: loginToken
                            }),
                        new PartnerGetInfoAction({})
                            .setRequestOptions({
                                ks: loginToken
                            })
                            .setDependency(['id', 0, 'partnerId']),
                        new UserRoleGetAction({ userRoleId: 0})
                            .setRequestOptions({
                                ks: loginToken
                            })
                            .setDependency(['userRoleId', 0, 'roleIds']),
                        new PermissionListAction({
                            filter: new KalturaPermissionFilter({
                                statusEqual: KalturaPermissionStatus.active,
                                typeIn: '2,3'
                            }),
                            pager: new KalturaFilterPager({
                                pageSize: 500
                            })
                        })
                            .setRequestOptions({
                                ks: loginToken,
                                responseProfile: new KalturaDetachedResponseProfile({
                                    type: KalturaResponseProfileType.includeFields,
                                    fields: 'name'
                                })
                            })
                    ];

                    return this.kalturaServerClient.multiRequest(requests)
                        .switchMap(
                            response => {
                                if (!response.hasErrors()) {
                                    return this._checkIfPartnerCanAccess(response[1].result);
                                } else {
                                    return Observable.of(true); // errors will be handled by the map function
                                }
                            },
                            (response, isPartnerAllowed) => ({ response, isPartnerAllowed })
                        )
                        .subscribe(
                            ({ response, isPartnerAllowed }) => {
                                if (!response.hasErrors() && isPartnerAllowed) {
                                    this._afterLogin(loginToken, storeCredentialsInSessionStorage, response[0].result, response[1].result, response[2].result, response[3].result);
                                    observer.next(true);
                                    observer.complete();
                                    return;
                                }

                                observer.next(false);
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

    public setAutomaticLoginCredentials(ks: string) {
        this._automaticLoginCredentials = { ks };
    }
    public loginAutomatically(): Observable<boolean> {

        const ksFromApp = this._automaticLoginCredentials && this._automaticLoginCredentials.ks;
        if (ksFromApp) {
            this._logger.info(`try to login automatically with KS provided explicitly by the app`);
            this._clearSessionCredentials();
            return this._loginByKS(ksFromApp, false);
        }

        const ksFromSession = this._browserService.getFromSessionStorage(ksSessionStorageKey);  // get ks from session storage;

        if (ksFromSession) {
            this._logger.info(`try to login automatically with KS stored in session storage`);
            return this._loginByKS(ksFromSession, true);
        }

        this._logger.debug(`bypass automatic login logic as no ks was provided by router or stored in session storage`);
        return Observable.of(false);
    }

    public switchPartnerId(partnerId: number): Observable<void> {
        return Observable.create((observer: any) => {
            return this.kalturaServerClient.request(new UserLoginByKsAction({requestedPartnerId: partnerId}))
                .subscribe(
                    result => {
                        this._logger.info(`switch partner account`, { partnerId });
                        this._browserService.setInSessionStorage(ksSessionStorageKey, result.ks);
                        const baseUrl = this._location.prepareExternalUrl('');

                        if (baseUrl) {
                            this._logger.info(`redirect the user to default page`, { url: baseUrl });
                            this._logout(false);
                            window.location.href = baseUrl;
                        } else {
                            this._logout();
                        }

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
        this._logger.info(` reload of browser`, { forceReload: false });
        document.location.reload(false);
    }

    private _logout(reloadPage = true) {
        this._logger.info(`log out user from the application`, { forceReload: reloadPage });
        this.kalturaServerClient.setDefaultRequestOptions({});
        this._permissionsService.flushPermissions();
        delete window['kmcng'];
        this._appUser = null;
        this._appEvents.publish(new UserLoginStatusEvent(false));
        this._pageExitVerificationService.removeAll();
        if (reloadPage) {
            this._logger.info(`force reload of browser`);
            document.location.reload(true);
        }
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
