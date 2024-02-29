import { Injectable, OnDestroy } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { serverConfig } from "config/server";
import { AppAuthentication } from "app-shared/kmc-shell";
import { KalturaMediaEntryFilter } from 'kaltura-ngx-client';

export enum SortDirection {
    Desc = -1,
    Asc = 1
}

export type KalturaPager = {
    pageSize: number,
    pageIndex: number
}

export type AdvancedCadence = {
    day?: 'SUN'| 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';
    dayNumber?: number;
    numberOfUnits?: number;
    dateUnit?: 'week' | 'month' | 'year';
}

export type RunningCadence = {
    cadence: 'advanced' | 'once a day' | 'once a week' | 'once a month' | 'once a year' | 'end of week' | 'end of month' | 'end of year';
    advancedCadence: AdvancedCadence;
}

export type ManagedTasksProfile = {
    objectType: string;
    id: string;
    name: string;
    partnerId: number;
    description: string;
    objectFilter?: any;
    objectFilterType?: string;
    status: 'deleted' | 'disabled' | 'enabled';
    tasksIds: string[];
    nextRunDate: Date;
    lastExecutionTime: Date;
    runningCadence: RunningCadence;
    createdAt: Date;
    updatedAt: Date;
}

export type ObjectState = {
    objectType: string;
    id: string;
    partnerId: number;
    managedTasksProfileId: string;
    managedTasksProfileName: string;
    status: string;
    objectId: string;
    objectName: string;
    duration: number;
    plannedExecutionTime: Date;
    inReview: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type LoadManagedTasksProfilesResponse = {
    objects: ManagedTasksProfile[];
    totalCount: number;
}

export type LoadObjectStateResponse = {
    objects: ObjectState[];
    totalCount: number;
}

@Injectable()
export class MrStoreService implements OnDestroy {

    public rulesIds = [];
    public selectedRule: ManagedTasksProfile = null;

    constructor(private _http: HttpClient,
                private _appAuthentication: AppAuthentication) {
    }

    // ------------------------- Managed tasks profiles API ---------------------------- //

    public loadProfiles(pageSize: number, pageIndex: number, sortField: string, sortOrder: number, idIn: string[] = []): Observable<LoadManagedTasksProfilesResponse> {
        const pager: KalturaPager = {
            pageIndex,
            pageSize
        }
        const orderBy = sortOrder === SortDirection.Desc ? `-${sortField}` : `${sortField}`;
        const body = {pager, orderBy};
        if (idIn.length) {
            Object.assign(body, {idIn});
        }
        try {
            return this._http.post(`${serverConfig.externalServices.mrEndpoint.uri}/managedTasksProfile/list`, body, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<LoadManagedTasksProfilesResponse>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to load managed tasks profiles'));
        }
    }

    public createProfile(profile: any): Observable<any> {
        try {
            return this._http.post(`${serverConfig.externalServices.mrEndpoint.uri}/managedTasksProfile/create`, profile, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to create managed tasks profile'));
        }
    }

    public deleteProfile(id: string): Observable<any> {
        try {
            return this._http.post(`${serverConfig.externalServices.mrEndpoint.uri}/managedTasksProfile/delete`, {id}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to delete managed tasks profile ' + id));
        }
    }

    public updateProfile(profile: ManagedTasksProfile): Observable<any> {
        try {
            return this._http.post(`${serverConfig.externalServices.mrEndpoint.uri}/managedTasksProfile/update`, profile, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to update managed tasks profile ' + profile.id));
        }
    }
    public loadProfile(id: string): Observable<any> {
        try {
            return this._http.post(`${serverConfig.externalServices.mrEndpoint.uri}/managedTasksProfile/get`, {id}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to load managed tasks profile ' + id));
        }
    }

    // ------------------------- Object State API ---------------------------- //

    public loadObjectStates(filter: any = {}): Observable<LoadObjectStateResponse> {
        try {
            return this._http.post(`${serverConfig.externalServices.mrEndpoint.uri}/objectState/list`, filter, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<LoadObjectStateResponse>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to load object state list'));
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
