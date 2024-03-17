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
    categoryIds?: string[];
    userGroupsInclude?: string[];
    userGroupsExclude?: string[];
    userIdSource?: 'upn' | 'azure-id';
    userIdSuffixMethod?: 'remove' | 'append';
    userIdSuffix?: string;
    userNotFoundMethod?: 'create' | 'assign-default';
    defaultUserId?: string;
    attendeesRoles? : 'co-editors' | 'co-publishers' | 'co-viewers';
    presentersRoles? : 'co-editors' | 'co-publishers' | 'co-viewers';
    coOrganizerRoles? : 'co-editors' | 'co-publishers' | 'co-viewers';
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

    public createProfile(profile: TeamsIntegration): Observable<any> {
        try {
            return this._http.post(`${serverConfig.externalServices.vendorIntegrationsEndpoint.uri}/teams-integration/add`, profile, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<TeamsIntegration>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to create new teams integrations profile'));
        }
    }

    public updateProfile(profile: TeamsIntegration): Observable<any> {
        try {
            return this._http.post(`${serverConfig.externalServices.vendorIntegrationsEndpoint.uri}/teams-integration/update`, profile, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<TeamsIntegration>;
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
