import { Injectable, OnDestroy } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { serverConfig } from "config/server";
import { AppAuthentication } from "app-shared/kmc-shell";
import {KalturaMediaEntry, KalturaMediaEntryFilter} from 'kaltura-ngx-client';

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
    dateUnit?: 'day' | 'week' | 'month' | 'year';
}

export type RunningCadence = {
    cadence: 'advanced' | 'once a day' | 'once a week' | 'once a month' | 'once a year' | 'end of week' | 'end of month' | 'end of year';
    advancedCadence: AdvancedCadence;
}

export type ManagedTasksProfile = {
    objectType: string;
    id: string;
    name: string;
    ownerId: string;
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
    audit: {
        auditApproval: boolean;
        reviewPeriod: number;
    }
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
    objectDuration: number;
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
export type RequestObject = {
    action: 'create' | 'update' | 'delete';
    dto: Task;
}

export type Task = {
    id?: string;
    type: 'deleteEntry' | 'deleteFlavors' | 'sendNotification' | 'modifyEntry' | 'generateReport';
    managedTasksProfileId?: string;
    status?: 'deleted' | 'disabled' | 'enabled';
    taskParams?: {
        deleteFlavorsTaskParams?: {
            actionType: 'deleteList' | 'keepList';
            flavorParamsIds: string;
        },
        deleteEntryTaskParams?: {
            recycleBin: boolean;
            dualScreenOptions: {
                behavior: 'applyAction' | 'expose',
                tag?: string
            }
        },
        modifyEntryTaskParams?: {
            kalturaEntry?: any,
            addToCategoryIds?: string;
            removeFromCategoryIds?: string;
            addTags?: string;
            removeTags?: string;
        }
        sendNotificationTaskParams?: {
            notificationType?: 'headsUp' | 'executionSummary' | 'profileScan' | 'executionSummary' | 'CUSTOM';
            daysToWait?: number;
            recipients?: {
                userIds?: string[];
                groupIds?: string[];
                objectOwner?: boolean;
                managedTasksProfileOwner?: boolean;
            }
            messageSubject?: string;
            messageBody?: string;
        }
    }
}

export type LoadTasksResponse = {
    objects: Task[];
    totalCount: number;
}

export type Report = {
    createdAt: Date;
    id: string;
    managedTasksProfileId: string;
    managedTasksProfileName: string;
    requestedDate: Date;
    objectsCount: number;
    status: 'ready' | 'error' | 'processing';
    type: 'executionSummary' | 'watchProfileResults' | 'profileDryRun';
}

export type LoadReportsResponse = {
    objects: Report[];
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

    public updateReviewStatus(review: ObjectState, status: string): Observable<ObjectState> {
        try {
            return this._http.post(`${serverConfig.externalServices.mrEndpoint.uri}/objectState/update`, {id: review.id, status}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<ObjectState>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to update object state status'));
        }
    }

    public dismissReview(review: ObjectState): Observable<ObjectState> {
        try {
            return this._http.post(`${serverConfig.externalServices.mrEndpoint.uri}/objectState/update`, {id: review.id, inReview: false}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<ObjectState>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to update object state inReview'));
        }
    }

    public performReview(review: ObjectState): Observable<ObjectState> {
        try {
            return this._http.post(`${serverConfig.externalServices.mrEndpoint.uri}/objectState/update`, {id: review.id, plannedExecutionTime: new Date()}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<ObjectState>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to update object state plannedExecutionTime'));
        }
    }

    public bulkUpdateStatus(ids: string[], status: string): Observable<any> {
        try {
            return this._http.post(`${serverConfig.externalServices.mrEndpoint.uri}/objectState/bulkUpdate`, {ids, status}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to bulk update object states status'));
        }
    }

    public bulkDismiss(ids: string[]): Observable<any> {
        try {
            return this._http.post(`${serverConfig.externalServices.mrEndpoint.uri}/objectState/bulkUpdate`, {ids, inReview: false}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to bulk update object states status'));
        }
    }

    public bulkPerformNow(ids: string[]): Observable<any> {
        try {
            return this._http.post(`${serverConfig.externalServices.mrEndpoint.uri}/objectState/bulkUpdate`, {ids, plannedExecutionTime: new Date()}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to bulk update object states plannedExecutionTime'));
        }
    }

    public notifyOwners(ids: string[], subject: string, textBody: string): Observable<any> {
        try {
            return this._http.post(`${serverConfig.externalServices.mrEndpoint.uri}/objectState/notifyOwners`, {ids, textBody, subject}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to send notify owners request'));
        }
    }

    // ------------------------- Task API ---------------------------- //

    public loadTasks(managedTasksProfileId: string): Observable<LoadTasksResponse> {
        try {
            return this._http.post(`${serverConfig.externalServices.mrEndpoint.uri}/task/list`, {managedTasksProfileId}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<LoadTasksResponse>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to load tasks list'));
        }
    }

    public saveActions(requests: RequestObject[]): Observable<any> {
        try {
            return this._http.post(`${serverConfig.externalServices.mrEndpoint.uri}/task/multiRequest`, {requests}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<any>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to save actions'));
        }
    }

    // ------------------------- Reports API ---------------------------- //

    public loadReports(filter: any = {}): Observable<LoadReportsResponse> {
        try {
            return this._http.post(`${serverConfig.externalServices.mrEndpoint.uri}/report/list`, filter, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<LoadReportsResponse>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to load reports list'));
        }
    }

    public downloadReport(id: string): Observable<string> {
        try {
            return this._http.post(`${serverConfig.externalServices.mrEndpoint.uri}/report/serve`, {id}, this.getHttpOptions()).pipe(cancelOnDestroy(this)) as Observable<string>;
        } catch (ex) {
            return throwError(new Error('An error occurred while trying to serve report'));
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

    private getHttpDownloadOptions() {
        const ks = this._appAuthentication.appUser.ks;
        return {
            headers: new HttpHeaders({
                'authorization': `KS ${ks}`,
                'Content-Type': 'text/csv',
            })
        };
    }

    ngOnDestroy(): void {
    }
}
