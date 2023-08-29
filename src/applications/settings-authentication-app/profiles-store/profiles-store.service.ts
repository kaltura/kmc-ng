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
    status: 'complete' | 'incomplete';
}

export type Pager = {
    offset: number,
    limit: number
}

export type LoadProfilesResponse = {
    objects: AuthProfile[];
    totalCount: number;
}

@Injectable()
export class ProfilesStoreService implements OnDestroy {

    constructor(private _http: HttpClient,
                private _appAuthentication: AppAuthentication) {
    }

    public loadProfiles(pageSize: number, pageIndex: number, sortField: string, sortOrder: number): Observable<LoadProfilesResponse> {
        const ks = this._appAuthentication.appUser.ks;
        const pager: Pager = {
            offset: pageIndex,
            limit: pageSize
        }
        const httpOptions = {
            headers: new HttpHeaders({
                'authorization': `KS ${ks}`,
                'Content-Type': 'application/json',
            })
        };
        const orderBy = sortOrder === SortDirection.Desc ? `-${sortField}` : `+${sortField}`;
        try {
            return this._http.post(`${serverConfig.authBrokerServer.authBrokerBaseUrl}/api/v1/auth-profile/list`, {pager, orderBy}, httpOptions).pipe(cancelOnDestroy(this)) as Observable<LoadProfilesResponse>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to load authentication profiles'));
        }
    }

    public deleteProfile(id: string): Observable<any> {
        const ks = this._appAuthentication.appUser.ks;
        const httpOptions = {
            headers: new HttpHeaders({
                'authorization': `KS ${ks}`,
                'Content-Type': 'application/json',
            })
        };
        try {
            return this._http.post(`${serverConfig.authBrokerServer.authBrokerBaseUrl}/api/v1/auth-profile/delete`, {id}, httpOptions).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to load authentication profiles'));
        }
    }

    ngOnDestroy(): void {
    }
}
