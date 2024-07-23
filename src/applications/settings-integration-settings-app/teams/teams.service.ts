import { Injectable, OnDestroy } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { serverConfig } from "config/server";
import { AppAuthentication } from "app-shared/kmc-shell";
import {KalturaWebexAPIIntegrationSetting, WebexVendorListAction, WebexVendorSubmitRegistrationAction} from 'kaltura-ngx-client';

export enum SortDirection {
    Desc = -1,
    Asc = 1
}

export type KalturaPager = {
    pageSize: number,
    pageIndex: number
}

export type TeamsIntegrationSettings = {
    uploadRecordings: boolean;
    uploadTranscripts: boolean;
    categories?: string[];
    userGroupsInclude?: any[];
    userGroupsExclude?: any[];
    userIdSource?: 'upn' | 'azure-id';
    userIdSuffixMethod?: 'remove' | 'append';
    userIdSuffix?: string;
    userNotFoundMethod?: 'create' | 'assign-default';
    defaultUserId?: string;
    attendeesRoles? : ('co-editors' | 'co-publishers' | 'co-viewers')[];
    presentersRoles? : ('co-editors' | 'co-publishers' | 'co-viewers')[];
    coOrganizerRoles? : ('co-editors' | 'co-publishers' | 'co-viewers')[];
}

export type TeamsIntegration = {
    name: string;
    tenantId: string;
    appClientId: string;
    appClientSecret: string;
    createdAt?: Date;
    id?: string;
    objectType?: string
    partnerId?: number;
    settings?: TeamsIntegrationSettings;
    status?: 'enabled' | 'disabled';
    updatedAt?: Date;
    lastError?: {
        code: string,
        message: string
    }
}

export type LoadTeamsIntegrationResponse = {
    objects: TeamsIntegration[];
    totalCount: number;
}

@Injectable()
export class TeamsService implements OnDestroy {

    public selectedProfile: any = null;

    constructor(private _http: HttpClient,
                private _appAuthentication: AppAuthentication) {
    }

    public loadTeamsIntegrationProfiles(filter: any = {}): Observable<LoadTeamsIntegrationResponse> {
        try {
            return this._http.post(`${serverConfig.externalServices.vendorIntegrationsEndpoint.uri}/teams-integration/list`, filter, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<LoadTeamsIntegrationResponse>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to load teams integrations list'));
        }
    }

    public createProfile(profile: {teamsIntegration: TeamsIntegration}): Observable<TeamsIntegration> {
        try {
            return this._http.post(`${serverConfig.externalServices.vendorIntegrationsEndpoint.uri}/teams-integration/add`, profile, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<TeamsIntegration>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to create new teams integrations profile'));
        }
    }

    public updateProfile(event: {id: string, teamsIntegration: TeamsIntegration}): Observable<TeamsIntegration> {
        try {
            return this._http.post(`${serverConfig.externalServices.vendorIntegrationsEndpoint.uri}/teams-integration/update`, event, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<TeamsIntegration>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to update teams integrations profile'));
        }
    }

    public changeProfileStatus(id: string, status: 'enabled' | 'disabled'): Observable<TeamsIntegration> {
        const action = status === 'enabled' ? 'enable' : 'disable';
        try {
            return this._http.post(`${serverConfig.externalServices.vendorIntegrationsEndpoint.uri}/teams-integration/${action}`, {id}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<TeamsIntegration>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to enable teams integrations profile'));
        }
    }

    public deleteProfile(id: string): Observable<any> {
        try {
            return this._http.post(`${serverConfig.externalServices.vendorIntegrationsEndpoint.uri}/teams-integration/delete`, {id}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<TeamsIntegration>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to update teams integrations profile'));
        }
    }

    // ------------------------- Common ---------------------------- //
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
