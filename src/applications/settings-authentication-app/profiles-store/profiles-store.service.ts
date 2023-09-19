import { Injectable, OnDestroy } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { serverConfig } from "config/server";
import { AppAuthentication } from "app-shared/kmc-shell";
import {SortDirection} from "../../content-rooms-app/rooms/rooms-store/rooms-store.service";

export type AuthStrategyConfig = {
    callbackUrl: string;
    cert: string;
    digestAlgorithm: string;
    disableRequestedAuthnContext: boolean;
    enableAssertsDecryption: boolean;
    enableRequestSign: boolean;
    entryPoint: string;
    issuer: string;
    requestIdExpirationPeriodMs: number;
    signatureAlgorithm: string;
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
    userAttributeMappings: Record<string, string>,
    userGroupMappings: Record<string, string>,
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
            return this._http.post(`${serverConfig.authBrokerServer.authBrokerBaseUrl}/api/v1/auth-profile/list`, {pager, orderBy}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<LoadProfilesResponse>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to load authentication profiles'));
        }
    }

    public createProfile(profile: any): Observable<any> {
        try {
            return this._http.post(`${serverConfig.authBrokerServer.authBrokerBaseUrl}/api/v1/auth-profile/add`, profile, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to create profile'));
        }
    }

    public deleteProfile(id: string): Observable<any> {
        try {
            return this._http.post(`${serverConfig.authBrokerServer.authBrokerBaseUrl}/api/v1/auth-profile/delete`, {id}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to delete authentication profile ' + id));
        }
    }

    public updateProfile(profile: AuthProfile): Observable<any> {
        try {
            return this._http.post(`${serverConfig.authBrokerServer.authBrokerBaseUrl}/api/v1/auth-profile/update`, profile, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to update authentication profile ' + profile.id));
        }
    }

    public listApplications(): Observable<any> {
        const filter = {
            "appType": "kmc",
            "status": "enabled",
            "appCustomIdIn": [this._appAuthentication.appUser.partnerInfo.partnerId.toString()]
        }
        try {
            return this._http.post(`${serverConfig.authBrokerServer.appRegistryBaseUrl}/api/v1/app-registry/list`, {filter}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to load app from registry'));
        }
    }

    public listSubscriptions(appGuid: string): Observable<any> {
        const filter = {appGuid};
        try {
            return this._http.post(`${serverConfig.authBrokerServer.authBrokerBaseUrl}/api/v1/app-subscription/list`, {filter}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to load app-subscription list'));
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
