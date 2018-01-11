import { Injectable, OnDestroy } from '@angular/core';
import { PartnerListFeatureStatusAction } from 'kaltura-ngx-client/api/types/PartnerListFeatureStatusAction';
import { KalturaFeatureStatusListResponse } from 'kaltura-ngx-client/api/types/KalturaFeatureStatusListResponse';
import { KalturaFeatureStatusType } from 'kaltura-ngx-client/api/types/KalturaFeatureStatusType';
import { KmcServerPolls } from 'app-shared/kmc-shared/server-polls';
import { environment } from 'app-environment';
import { CategoriesStatusRequestFactory } from './categories-status-request-factory';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { KalturaFeatureStatus } from 'kaltura-ngx-client/api/types/KalturaFeatureStatus';
import { PollInterval } from '@kaltura-ng/kaltura-common';
import { KalturaAPIException, KalturaClient, KalturaMultiRequest, KalturaRequest, KalturaRequestBase } from 'kaltura-ngx-client';

export interface CategoriesStatus {
    lock: boolean;
    update: boolean;
}

@Injectable()
export class CategoriesStatusMonitorService implements OnDestroy {

    // TODO [kmcng] replace this function with log library
    private _log(level: 'silly' | 'verbose' | 'info' | 'warn' | 'error', message: string, context?: string): void {
        const messageContext = context || 'general';
        const origin = 'categories status monitor';
        const formattedMessage = `log: [${level}] [${origin}] ${messageContext}: ${message}`;
        switch (level) {
            case 'silly':
            case 'verbose':
            case 'info':
                console.log(formattedMessage);
                break;
            case 'warn':
                console.warn(formattedMessage);
                break;
            case 'error':
                console.error(formattedMessage);
                break;
        }
    }

    private _pollingState: null | 'running' = null;
    private _pollingInterval: PollInterval = <PollInterval>environment.categoriesShared.categoriesStatusSampleInterval;

    private _status = new BehaviorSubject<CategoriesStatus>({ lock: false, update: false });
    public readonly $categoriesStatus = this._status.asObservable();

    private _categoriesStatusRequestFactory = new CategoriesStatusRequestFactory();
    

    constructor( private _kmcServerPolls: KmcServerPolls, private _kalturaClient: KalturaClient ) {
        this._log('silly', 'constructor()');
        this._startPolling();
    }

   
    ngOnDestroy() {
        this._log('silly', 'ngOnDestroy()');
        this._status.complete();
    }
    
    private _startPolling(): void {
        if (this._pollingState !== 'running') {
            this._pollingState = 'running';
            this._log('info', `start server polling every ${this._pollingInterval} seconds to get categories status`);

            this._kmcServerPolls.register<KalturaFeatureStatusListResponse>(this._pollingInterval , this._categoriesStatusRequestFactory)
                .cancelOnDestroy(this)
                .subscribe(response => {
                    this._handleResponse(response);
                });
        }
    }

    private _handleResponse(response): void{
        if (response.error) {
            this._log('warn', `error occurred while trying to get categories status from server. server error: ${response.error.message}`);
            this._status.next({lock: false, update: false});
            return;
        }
        let lockFlagFound = false;
        let updateFlagFound = false;

        const status: KalturaFeatureStatusListResponse = response.result;
        if (status && status.objects) {
            status.objects.forEach((kfs: KalturaFeatureStatus) => {
                switch (kfs.type) {
                    case KalturaFeatureStatusType.lockCategory:
                        lockFlagFound = true;
                        updateFlagFound = true;
                        break;
                    case KalturaFeatureStatusType.category:
                        updateFlagFound = true;
                        break;
                }
            });
        }
        this._log('info', `got categories status: locked: ${lockFlagFound}, update: ${updateFlagFound}`);
        this._status.next({lock: lockFlagFound, update: true});

    }

    // API to invoke immediate categories status update
    public updateCategoriesStatus():void{
        this._kalturaClient.request(new PartnerListFeatureStatusAction({})).cancelOnDestroy(this)
	        .subscribe(response => {
                this._handleResponse(response);
            });
    }
}
