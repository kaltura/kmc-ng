import { Injectable, OnDestroy } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { serverConfig } from "config/server";
import { AppAuthentication } from "app-shared/kmc-shell";

export enum SortDirection {
    Desc = -1,
    Asc = 1
}

export type AuthStrategyConfig = {
    callbackUrl: string;
    cert: string;
    digestAlgorithm: string;
    disableRequestedAuthnContext: boolean;
    enableAssertsDecryption: boolean;
    enableRequestSign: boolean;
    entryPoint: string;
    issuer: string;
    logoutUrl: string;
    idpMetadataUrl: string;
    requestIdExpirationPeriodMs: number;
    signatureAlgorithm: string;
    identifierFormat: string;
    validateInResponseTo: boolean;
}

export type AuthProfile = {
    adminGroups: string[];
    authStrategy: string;
    authStrategyConfig: AuthStrategyConfig;
    createNewGroups: boolean;
    createdAt: Date;
    description: string;
    groupAttributeName: string;
    id: string;
    ksPrivileges: string;
    name: string;
    objectType: string;
    partnerId: number;
    providerType: string;
    removeFromExistingGroups: boolean;
    syncDelayTimeoutMin: number;
    updatedAt: Date;
    userAttributeMappings: any,
    userGroupMappings: any,
    userGroupsSyncAll: boolean;
    userIdAttribute: string;
    version: number;
    isAdminProfile: boolean;
    status: 'complete' | 'draft';
}

export type AppSubscription = {
    appErrorPage: string;
    appGuid: string;
    appLandingPage: string;
    attributePermissionListStatus: string;
    authProfileIds: string[];
    createdAt: string;
    id: string;
    name: string;
    objectType: string;
    partnerId: number;
    permissionList: string[];
    permissionListStatus: string;
    redirectMethod: string;
    status: string;
    updatedAt: string;
    userGroupsSyncAll: boolean;
    version: number;
}

export type OrganizationDomain = {
    domain: string;
    organizationId: string;
}

export type App = {
    appCustomId: string;
    appCustomName: string;
    appType: string;
    createdAt: string;
    id: string;
    objectType: string;
    organizationDomain: OrganizationDomain;
    partnerId: number;
    status: string;
    updatedAt: string;
    version: number;
}

export type Pager = {
    offset: number,
    limit: number
}

export type LoadProfilesResponse = {
    objects: AuthProfile[];
    totalCount: number;
}

export type LoadSubscriptionsResponse = {
    objects: AppSubscription[];
    totalCount: number;
}

export type LoadApplicationResponse = {
    objects: App[];
    totalCount: number;
}

@Injectable()
export class ProfilesStoreService implements OnDestroy {

    constructor(private _http: HttpClient,
                private _appAuthentication: AppAuthentication) {
    }

    public loadProfiles(pageSize: number, pageIndex: number, sortField: string, sortOrder: number): Observable<LoadProfilesResponse> {
        const pager: Pager = {
            offset: pageIndex,
            limit: pageSize
        }
        const orderBy = sortOrder === SortDirection.Desc ? `-${sortField}` : `${sortField}`;
        try {
            return this._http.post(`${serverConfig.externalServices.authBrokerServer.uri}/api/v1/auth-profile/list`, {pager, orderBy}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<LoadProfilesResponse>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to load authentication profiles'));
        }
    }

    public createProfile(profile: any): Observable<any> {
        try {
            return this._http.post(`${serverConfig.externalServices.authBrokerServer.uri}/api/v1/auth-profile/add`, profile, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to create profile'));
        }
    }

    public deleteProfile(id: string): Observable<any> {
        try {
            return this._http.post(`${serverConfig.externalServices.authBrokerServer.uri}/api/v1/auth-profile/delete`, {id}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to delete authentication profile ' + id));
        }
    }

    public updateProfile(profile: AuthProfile): Observable<any> {
        try {
            return this._http.post(`${serverConfig.externalServices.authBrokerServer.uri}/api/v1/auth-profile/update`, profile, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to update authentication profile ' + profile.id));
        }
    }

    public createApplication(domain = '', organizationId = ''): Observable<any> {
        const request = {
            appCustomId: this._appAuthentication.appUser.partnerInfo.partnerId.toString(),
            appType: "kmc",
            appCustomName: "kmc",
            organizationDomain: {
                domain,
                organizationId
            }
        }
        try {
            return this._http.post(`${serverConfig.externalServices.appRegistryServer.uri}/api/v1/app-registry/add`, request, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to create app'));
        }
    }

    public updateApplication(id: string, domain = '', organizationId = ''): Observable<any> {
        const request = {
            id,
            organizationDomain: {
                domain,
                organizationId
            }
        }
        try {
            return this._http.post(`${serverConfig.externalServices.appRegistryServer.uri}/api/v1/app-registry/update`, request, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to update app'));
        }
    }

    public listApplications(): Observable<any> {
        const filter = {
            "appType": "kmc",
            "status": "enabled",
            "appCustomIdIn": [this._appAuthentication.appUser.partnerInfo.partnerId.toString()]
        }
        try {
            return this._http.post(`${serverConfig.externalServices.appRegistryServer.uri}/api/v1/app-registry/list`, {filter}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to load app from registry'));
        }
    }

    public createSubscription(appGuid: string, authProfileIds: string[]): Observable<any> {
        const request = {
            name: "kmc app subscription",
            appGuid,
            authProfileIds,
            appLandingPage: window.location.origin + "/actions/persist-login-by-ks",
            appErrorPage: window.location.origin + "/login",
            redirectMethod: "HTTP-POST"
        }
        try {
            return this._http.post(`${serverConfig.externalServices.authBrokerServer.uri}/api/v1/app-subscription/add`, request, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to create subscription'));
        }
    }

    public updateSubscription(id: string, authProfileIds: string[]): Observable<any> {
        const request = { id, authProfileIds };
        try {
            return this._http.post(`${serverConfig.externalServices.authBrokerServer.uri}/api/v1/app-subscription/update`, request, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to update subscription'));
        }
    }

    public listSubscriptions(appGuid: string): Observable<any> {
        const filter = {appGuid};
        try {
            return this._http.post(`${serverConfig.externalServices.authBrokerServer.uri}/api/v1/app-subscription/list`, {filter}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to load app-subscription list'));
        }
    }

    public generatePvKeys(authProfileId: string, enableRequestSign: boolean, enableAssertsDecryption: boolean): Observable<any> {
        let pvKeys = '';
        if (enableRequestSign && !enableAssertsDecryption) {
            pvKeys = 'signingKey';
        }
        if (!enableRequestSign && enableAssertsDecryption) {
            pvKeys = 'decryptionKey';
        }
        if (enableRequestSign && enableAssertsDecryption) {
            pvKeys = 'both';
        }
        try {
            return this._http.post(`${serverConfig.externalServices.authBrokerServer.uri}/api/v1/auth-profile/generatePvKeys`, {authProfileId, pvKeys}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to generate profile Pv keys. Profile ID: ' + authProfileId));
        }
    }

    public getProfileStatus(profile: AuthProfile): 'complete' | 'draft' {
        let complete = true;
        if (profile.authStrategyConfig) {
            if (profile.authStrategyConfig.entryPoint === '__placeholder__' ||
                profile.authStrategyConfig.callbackUrl === '__placeholder__' ||
                profile.authStrategyConfig.cert === '__placeholder__') {
                complete = false;
            }
        } else {
            complete = false;
        }
        if (profile.userIdAttribute?.length) {
            let attributeFound = false;
            Object.values(profile.userAttributeMappings).forEach(value => {
                if (value === profile.userIdAttribute) {
                    attributeFound = true;
                }
            })
            if (!attributeFound) {
                complete = false;
            }
        } else {
            complete = false;
        }
        return complete ? 'complete' : 'draft';
    }


    public loadProfileMetadata(profileId: string): Observable<any> {
        try {
            return this._http.get(this.getProfileMetadataUrl(profileId),{ responseType: "text" }) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to load profile metadata'));
        }
    }

    public getProfileMetadataUrl(profileId: string): string {
        return `${serverConfig.externalServices.authBrokerServer.uri}/api/v1/auth-manager/saml/metadata/${this._appAuthentication.appUser.partnerInfo.partnerId}/${profileId}?rnd=${Math.random()}`;
    }

    private getHttpOptions() {
        const ks = this._appAuthentication.appUser.ks;
        return {
            headers: new HttpHeaders({
                'authorization': `KS ${ks}`,
                'Content-Type': 'application/json',
            })
        };
    }

    ngOnDestroy(): void {
    }
}
