import { Injectable } from '@angular/core';
import {
    EntryWidget
} from '../entry-widget';
import { KalturaClient } from 'kaltura-ngx-client';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { subApplicationsConfig } from 'config/sub-applications';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaSourceType } from 'kaltura-ngx-client/api/types/KalturaSourceType';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

@Injectable()
export class EntryDetailsWidget extends EntryWidget
{
    public _landingPage : string;

    constructor(
                kalturaServerClient: KalturaClient,
                private appAuthentication: AppAuthentication,
                logger: KalturaLogger)

    {
        super('entryDetails', logger);
    }


    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset()
    {

    }

    protected onActivate(firstTimeActivating: boolean) {
        const entry: KalturaMediaEntry = this.data;

	    this._landingPage = null;

        let landingPage = this.appAuthentication.appUser.partnerInfo.landingPage;
        if (landingPage) {
	        landingPage = landingPage.replace("{entryId}", entry.id);
	        if (landingPage.indexOf("http") !== 0){
	            landingPage = "http://" + landingPage;
            }
        }
        this._landingPage = landingPage;
    }
}
